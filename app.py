import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Painel Dengue RJ", page_icon="🦟", layout="wide")

MUNICIPIOS_RJ = {
    "Rio de Janeiro": 3304557,
    "Niterói": 3303302,
    "São Gonçalo": 3304904,
    "Duque de Caxias": 3301702,
    "Nova Iguaçu": 3303500,
    "Petrópolis": 3303906,
    "Campos dos Goytacazes": 3301009,
}

NIVEL_LABELS = {1: "Verde (sem alerta)", 2: "Amarelo (atenção)", 3: "Laranja (alerta)", 4: "Vermelho (emergência)"}
NIVEL_CORES = {1: "#2ecc71", 2: "#f1c40f", 3: "#e67e22", 4: "#e74c3c"}


@st.cache_data(ttl=3600)
def fetch_infodengue(geocode: int, disease: str, ey_start: int, ey_end: int) -> pd.DataFrame:
    url = (
        "https://info.dengue.mat.br/api/alertcity"
        f"?geocode={geocode}&disease={disease}&format=json"
        f"&ew_start=1&ew_end=53&ey_start={ey_start}&ey_end={ey_end}"
    )
    df = pd.read_json(url)
    df["data"] = pd.to_datetime(df["data_iniSE"], unit="ms")
    df = df.sort_values("data").reset_index(drop=True)
    return df


st.title("🦟 Painel de Arboviroses — Estado do RJ")
st.caption("Fonte: InfoDengue (Fiocruz / FGV). Dados agregados por semana epidemiológica e município.")

with st.sidebar:
    st.header("Filtros")
    municipio = st.selectbox("Município", list(MUNICIPIOS_RJ.keys()))
    doenca = st.selectbox("Doença", ["dengue", "chikungunya", "zika"])
    ano_ini, ano_fim = st.slider("Período (anos)", 2015, 2026, (2024, 2025))

geocode = MUNICIPIOS_RJ[municipio]

try:
    df = fetch_infodengue(geocode, doenca, ano_ini, ano_fim)
except Exception as e:
    st.error(f"Falha ao buscar InfoDengue: {e}")
    st.stop()

if df.empty:
    st.warning("Sem dados para esse filtro.")
    st.stop()

ultima = df.iloc[-1]
col1, col2, col3, col4 = st.columns(4)
col1.metric("Última semana epi.", int(ultima["SE"]))
col2.metric("Casos notificados (semana)", int(ultima["casos"]) if pd.notna(ultima["casos"]) else "—")
col3.metric("Rt estimado", f"{ultima['Rt']:.2f}" if pd.notna(ultima["Rt"]) else "—")
col4.metric("Nível de alerta", NIVEL_LABELS.get(int(ultima["nivel"]), "—"))

st.divider()

st.subheader(f"Série histórica — {doenca.capitalize()} em {municipio}")
fig = px.bar(
    df,
    x="data",
    y="casos",
    color=df["nivel"].map(NIVEL_LABELS),
    color_discrete_map={v: NIVEL_CORES[k] for k, v in NIVEL_LABELS.items()},
    labels={"data": "Semana", "casos": "Casos notificados", "color": "Nível"},
)
fig.update_layout(legend_title_text="Nível de alerta", height=400)
st.plotly_chart(fig, use_container_width=True)

col_a, col_b = st.columns(2)

with col_a:
    st.subheader("Casos estimados vs. notificados")
    fig2 = px.line(
        df,
        x="data",
        y=["casos", "casos_est"],
        labels={"data": "Semana", "value": "Casos", "variable": "Tipo"},
    )
    fig2.update_layout(height=350, legend_title_text="")
    st.plotly_chart(fig2, use_container_width=True)

with col_b:
    st.subheader("Clima — temperatura e umidade")
    fig3 = px.line(
        df,
        x="data",
        y=["tempmed", "umidmed"],
        labels={"data": "Semana", "value": "Medida", "variable": "Variável"},
    )
    fig3.update_layout(height=350, legend_title_text="")
    st.plotly_chart(fig3, use_container_width=True)

with st.expander("Ver tabela bruta"):
    st.dataframe(df, use_container_width=True)

st.caption(
    "⚠️ LGPD: dados agregados por município/semana. Sem identificação individual. "
    "Fonte oficial: https://info.dengue.mat.br"
)
