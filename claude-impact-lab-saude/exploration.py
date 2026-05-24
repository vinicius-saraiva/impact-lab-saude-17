import marimo

__generated_with = "0.23.8"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import duckdb
    import pandas as pd
    import plotly.express as px
    from pathlib import Path

    DADOS = Path(__file__).parent / "dados"
    con = duckdb.connect()

    con.execute(f"""
        CREATE OR REPLACE VIEW equipes AS
            SELECT * FROM read_parquet('{DADOS}/equipes_anonimizadas.parquet');
        CREATE OR REPLACE VIEW pacientes AS
            SELECT * FROM read_parquet('{DADOS}/pacientes_anonimizados.parquet');
        CREATE OR REPLACE VIEW eventos AS
            SELECT paciente_id, tipo, CAST(data_referencia AS DATE) AS data_referencia
            FROM read_parquet('{DADOS}/eventos_clinicos_anonimizados.parquet');
        CREATE OR REPLACE VIEW visitas AS
            SELECT profissional_id,
                   CAST(registrados_em AS DATE) AS registrados_em,
                   ordem_visita_dia,
                   paciente_id
            FROM read_parquet('{DADOS}/visitas_anonimizadas.parquet');
    """)
    return DADOS, con, mo, pd, px


@app.cell
def _(mo):
    mo.md(
        r"""
        # Impact Lab — Saúde Rio: exploração inicial

        Dataset anonimizado de visitas ACS, pacientes, eventos clínicos e equipes.
        Janela: 2025-01-01 → 2025-12-31 (date-shifted, sequência preservada).
        """
    )
    return


@app.cell
def _(con, mo):
    overview = con.execute("""
        SELECT 'equipes' AS tabela, COUNT(*) AS linhas FROM equipes UNION ALL
        SELECT 'pacientes', COUNT(*) FROM pacientes UNION ALL
        SELECT 'eventos',   COUNT(*) FROM eventos   UNION ALL
        SELECT 'visitas',   COUNT(*) FROM visitas
    """).fetchdf()
    mo.ui.table(overview, selection=None)
    return


@app.cell
def _(mo):
    mo.md(r"## Perfil dos pacientes")
    return


@app.cell
def _(con, px):
    demo = con.execute("""
        SELECT faixa_etaria, sexo, COUNT(*) AS n
        FROM pacientes
        GROUP BY faixa_etaria, sexo
        ORDER BY faixa_etaria
    """).fetchdf()
    px.bar(demo, x="faixa_etaria", y="n", color="sexo", barmode="group",
           title="Pacientes por faixa etária e sexo")
    return


@app.cell
def _(con, px):
    clinico = con.execute("""
        SELECT
            SUM(CAST(hipertenso AS INT))               AS hipertensos,
            SUM(CAST(diabetico AS INT))                AS diabeticos,
            SUM(CAST(gestacao AS INT))                 AS gestantes,
            SUM(CAST(situacao_vulnerabilidade AS INT)) AS vulneraveis,
            COUNT(*)                                   AS total
        FROM pacientes
    """).fetchdf().T.reset_index()
    clinico.columns = ["categoria", "n"]
    px.bar(clinico, x="categoria", y="n", title="Flags clínicas / sociais")
    return


@app.cell
def _(mo):
    mo.md(r"## Equipes e cobertura")
    return


@app.cell
def _(con, mo):
    cobertura = con.execute("""
        WITH visitas_por_pac AS (
            SELECT paciente_id, COUNT(*) AS n_visitas
            FROM visitas GROUP BY paciente_id
        )
        SELECT
            p.equipe_id,
            COUNT(*) AS pacientes,
            COUNT(v.paciente_id) AS pacientes_visitados,
            ROUND(100.0 * COUNT(v.paciente_id) / COUNT(*), 1) AS pct_visitados,
            ROUND(AVG(COALESCE(v.n_visitas, 0)), 2) AS visitas_medias_por_pac
        FROM pacientes p
        LEFT JOIN visitas_por_pac v USING (paciente_id)
        GROUP BY p.equipe_id
        ORDER BY pct_visitados ASC
    """).fetchdf()
    mo.ui.table(cobertura, selection=None, page_size=15)
    return


@app.cell
def _(con, px):
    visitas_paciente = con.execute("""
        SELECT
            CASE WHEN n_visitas = 0 THEN '0'
                 WHEN n_visitas BETWEEN 1 AND 2 THEN '1-2'
                 WHEN n_visitas BETWEEN 3 AND 5 THEN '3-5'
                 WHEN n_visitas BETWEEN 6 AND 10 THEN '6-10'
                 ELSE '11+' END AS bucket,
            COUNT(*) AS pacientes
        FROM (
            SELECT p.paciente_id, COUNT(v.paciente_id) AS n_visitas
            FROM pacientes p LEFT JOIN visitas v USING (paciente_id)
            GROUP BY p.paciente_id
        )
        GROUP BY bucket
        ORDER BY CASE bucket WHEN '0' THEN 0 WHEN '1-2' THEN 1
                             WHEN '3-5' THEN 2 WHEN '6-10' THEN 3 ELSE 4 END
    """).fetchdf()
    px.bar(visitas_paciente, x="bucket", y="pacientes",
           title="Distribuição de visitas por paciente em 2025")
    return


@app.cell
def _(mo):
    mo.md(r"## Eventos clínicos ao longo do ano")
    return


@app.cell
def _(con, px):
    serie = con.execute("""
        SELECT date_trunc('week', data_referencia) AS semana,
               tipo, COUNT(*) AS n
        FROM eventos
        GROUP BY semana, tipo ORDER BY semana
    """).fetchdf()
    px.line(serie, x="semana", y="n", color="tipo",
            title="Eventos clínicos por semana")
    return


@app.cell
def _(mo):
    mo.md(
        r"""
        ## Gap de cuidado — urgência sem visita posterior

        Pacientes que tiveram urgência/emergência e **não** receberam visita do ACS
        nos 30 dias seguintes. Candidatos óbvios a priorização.
        """
    )
    return


@app.cell
def _(con, mo):
    gap = con.execute("""
        WITH urg AS (
            SELECT paciente_id, data_referencia AS data_urg
            FROM eventos WHERE tipo = 'urgencia-emergencia-ou-internacao'
        ),
        visit_pos AS (
            SELECT u.paciente_id, u.data_urg,
                   MIN(v.registrados_em) AS prox_visita
            FROM urg u
            LEFT JOIN visitas v
              ON v.paciente_id = u.paciente_id
             AND v.registrados_em >= u.data_urg
             AND v.registrados_em <= u.data_urg + INTERVAL 30 DAY
            GROUP BY u.paciente_id, u.data_urg
        )
        SELECT
            COUNT(*) AS urgencias,
            SUM(CASE WHEN prox_visita IS NULL THEN 1 ELSE 0 END) AS sem_visita_30d,
            ROUND(100.0 * SUM(CASE WHEN prox_visita IS NULL THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_sem_visita
        FROM visit_pos
    """).fetchdf()
    mo.ui.table(gap, selection=None)
    return


@app.cell
def _(con, mo):
    gap_por_equipe = con.execute("""
        WITH urg AS (
            SELECT e.paciente_id, e.data_referencia AS data_urg, p.equipe_id
            FROM eventos e JOIN pacientes p USING (paciente_id)
            WHERE tipo = 'urgencia-emergencia-ou-internacao'
        ),
        visit_pos AS (
            SELECT u.equipe_id, u.paciente_id, u.data_urg,
                   MIN(v.registrados_em) AS prox_visita
            FROM urg u
            LEFT JOIN visitas v
              ON v.paciente_id = u.paciente_id
             AND v.registrados_em >= u.data_urg
             AND v.registrados_em <= u.data_urg + INTERVAL 30 DAY
            GROUP BY u.equipe_id, u.paciente_id, u.data_urg
        )
        SELECT equipe_id,
               COUNT(*) AS urgencias,
               SUM(CASE WHEN prox_visita IS NULL THEN 1 ELSE 0 END) AS sem_visita_30d,
               ROUND(100.0 * SUM(CASE WHEN prox_visita IS NULL THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_sem_visita
        FROM visit_pos
        GROUP BY equipe_id
        ORDER BY pct_sem_visita DESC
    """).fetchdf()
    mo.ui.table(gap_por_equipe, selection=None, page_size=15)
    return


@app.cell
def _(mo):
    mo.md(
        r"""
        ## Próximos passos sugeridos

        - **Score de prioridade por paciente**: combinar (a) gap desde última visita,
          (b) regra do manual (criança 7-8/ano, gestante mensal, crônico trimestral, etc),
          (c) evento clínico recente (urgência sobe, agendamento sobe).
        - **Roteirização**: dado um ACS/equipe, dia de trabalho e lista priorizada,
          ordenar por distância partindo da unidade (TSP-leve).
        - **Visão gestão**: cobertura por equipe/unidade, alertas de equipes com baixa
          taxa de visita pós-urgência, distribuição de carga entre profissionais.
        """
    )
    return


if __name__ == "__main__":
    app.run()
