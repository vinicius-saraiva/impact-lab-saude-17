-- ============================================================================
-- 006 — índices de performance + cache estático para acs_demo_options
-- ----------------------------------------------------------------------------
-- O JOIN visitas×pacientes na migration 005 fazia full-scan em ambas as
-- tabelas (~97k linhas cada), estourando o statement_timeout no Supabase.
-- Solução: índices + tabela pré-materializada (dados do picker não mudam
-- durante a demo).
-- ============================================================================

-- Índices de suporte às queries do motor
CREATE INDEX IF NOT EXISTS idx_pacientes_equipe_id   ON pacientes (equipe_id);
CREATE INDEX IF NOT EXISTS idx_visitas_paciente_id   ON visitas   (paciente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_profissional  ON visitas   (profissional_id);
CREATE INDEX IF NOT EXISTS idx_eventos_paciente_id   ON eventos   (paciente_id);
CREATE INDEX IF NOT EXISTS idx_vc_paciente_id        ON visitas_capturadas (paciente_id);
CREATE INDEX IF NOT EXISTS idx_vc_profissional_id    ON visitas_capturadas (profissional_id);

-- Tabela cache do picker (1 linha por equipe, 10 equipes)
DROP TABLE IF EXISTS _demo_acs_options;
CREATE TABLE _demo_acs_options AS
WITH equipe_stats AS (
    SELECT equipe_id,
           COUNT(*)::INT                            AS n_pacientes,
           SUM(gestacao::INT)::INT                  AS n_gestantes,
           SUM((hipertenso OR diabetico)::INT)::INT AS n_cronicos,
           SUM(situacao_vulnerabilidade::INT)::INT  AS n_vulneraveis
    FROM pacientes
    GROUP BY equipe_id
),
prof_da_equipe AS (
    SELECT p.equipe_id, v.profissional_id, COUNT(*)::INT AS visitas_prof
    FROM visitas v
    JOIN pacientes p USING (paciente_id)
    GROUP BY p.equipe_id, v.profissional_id
),
prof_principal AS (
    SELECT DISTINCT ON (equipe_id)
        equipe_id, profissional_id, visitas_prof
    FROM prof_da_equipe
    ORDER BY equipe_id, visitas_prof DESC
)
SELECT
    pp.profissional_id,
    pp.equipe_id,
    es.n_pacientes,
    es.n_gestantes,
    es.n_cronicos,
    es.n_vulneraveis,
    pp.visitas_prof AS n_visitas_2025
FROM prof_principal pp
JOIN equipe_stats es USING (equipe_id)
ORDER BY es.n_gestantes DESC NULLS LAST, es.n_cronicos DESC
LIMIT 10;

-- Reescreve a função para ler da tabela cache — resposta < 1ms
CREATE OR REPLACE FUNCTION acs_demo_options()
RETURNS TABLE (
    profissional_id TEXT,
    equipe_id       TEXT,
    n_pacientes     INT,
    n_gestantes     INT,
    n_cronicos      INT,
    n_vulneraveis   INT,
    n_visitas_2025  INT
)
LANGUAGE SQL
STABLE
AS $$
SELECT profissional_id, equipe_id, n_pacientes, n_gestantes,
       n_cronicos, n_vulneraveis, n_visitas_2025
FROM _demo_acs_options
ORDER BY n_gestantes DESC NULLS LAST, n_cronicos DESC;
$$;

GRANT EXECUTE ON FUNCTION acs_demo_options() TO anon, authenticated;
GRANT SELECT ON _demo_acs_options TO anon, authenticated;
