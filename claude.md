# Projeto Hackathon — Saúde Pública RJ (Claude Impact Lab 24/05/2026)

## Time
- Advogado-founder (PM/pitch)
- Médica de família (domain expert, validação clínica)
- 3 técnicos IA não-devs (vibe coders)

## Stack
- Python 3.11+, Streamlit (UI principal de dados)
- Lovable.dev (landing/marketing) via MCP em https://mcp.lovable.dev
- v0/Vercel para componentes React isolados se necessário
- Pandas + Plotly + Folium para visualização e mapas
- Dados: DataSUS (TabNet/SIM/SIH via pysus), data.rio (CSV/GeoJSON), InfoDengue (https://info.dengue.mat.br/api/alertcity)

## Convenções
- Português brasileiro em UI, código em inglês
- Variáveis de ambiente em .env (nunca commitar)
- LGPD: nenhum dado pessoal identificável é aceito; agregue por município/semana
- Cite a fonte oficial em todo gráfico (logo/rodapé)

## Comandos
- `streamlit run app.py --server.port 8501`
- `python -m pytest tests/ -v` (se houver tempo pra testes)

## Regras críticas
- **NÃO** instalar mais MCPs durante o evento. Stack fechada.
- Sempre rodar Plan Mode (Shift+Tab+Tab) antes de qualquer mudança que toque >2 arquivos.
- Use Context7 MCP para qualquer dúvida de API de Streamlit/Plotly/Folium.
- Use a skill pptx para o deck final às 17h.
- /clear entre tarefas não relacionadas (UI vs ETL vs pitch).
