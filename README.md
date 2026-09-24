<div align="center">

  <img src="icons/icon-192.png" alt="Fish Clicker Logo" width="128" height="128" style="image-rendering: pixelated;">

  # 🎣 FISH CLICKER

  **Um jogo clicker retrô de pescaria em pixel art pura, rico em espécies, eventos climáticos dinâmicos, aquário vivo com buffs e suporte PWA 100% offline.**

  [![PWA Ready](https://img.shields.io/badge/PWA-100%25_Offline-0891b2?style=for-the-badge&logo=pwa&logoColor=white)](https://stayflinstons.github.io/fish-clicker/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://stayflinstons.github.io/fish-clicker/)
  [![Pure Pixel Art](https://img.shields.io/badge/Graphics-Canvas_Pixel_Art-f59e0b?style=for-the-badge)](https://stayflinstons.github.io/fish-clicker/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)

  <br />

  ### 🌐 [▶ JOGAR AGORA NO NAVEGADOR](https://stayflinstons.github.io/fish-clicker/)
  *(Funciona em Computador, Android e iPhone com suporte a instalação em tela cheia)*

</div>

---

## 📖 Sobre o Jogo

**Fish Clicker** é um jogo incremental (*clicker / idle*) que recria a atmosfera aconchegante dos clássicos de pesca retrô. 

Começando como um pescador com uma humilde vara de bambu e minhocas simples, você acumula ouro, expande seus equipamentos, explora horários diferentes do dia e desvenda os mistérios do **Lago Sagrado (Mundo 1)** e do **Abismo das Sombras (Mundo 2)**.

---

## ✨ Funcionalidades Principais

### 🌅 1. Cenários Vivos & Ciclo Dinâmico
* **4 Fases do Dia em Pixel Art:** O lago evolui visualmente em tempo real entre **Dia Claro**, **Pôr do Sol Dourado**, **Noite Estrelada** e o lendário **Eclipse Vermelho**.
* **Espécies Exclusivas por Horário:** Determinados peixes lendários e míticos só emergem durante o meio-dia, no poente ou sob a meia-noite.
* **Evento do Mar Sangrento:** Ao fisgar o raro Peixe da Lua Sangrenta, o lago se tinge de carmesim, cardumes avermelhados nadam no fundo e todos os peixes fisgados ganham auras poderosas por 60 segundos.

### 🐟 2. Ecossistema Rico (50+ Espécies)
* Mais de 50 espécies divididas em 7 escalões de raridade:
  * ⚪ **Comum** | 🔵 **Incomum** | 🟣 **Raro** | 🟡 **Épico** | 🔴 **Lendário** | 🌌 **Mítico** | 👁️ **Secreto**
* Cada peixe possui sprite pixel art único, variação orgânica de peso, valor de mercado e afinidades de bônus passivos.

### 🎣 3. Equipamentos & Força da Vara (PWR)
* **Progressão de Varas & Iscas:** Desde a Vara de Bambu até a Vara Cósmica Ancestral.
* **Coleção Visual de Anzois:** Cada isca equipada exibe seu próprio anzol temático e animado na ponta da linha de pesca submersa.
* **Poder da Vara (PWR):** Varas superiores aplicam um bônus dinâmico na rolagem de peso (+1% a +12%), recompensando seu investimento com peixes gigantes nos limites da espécie.

### 🐠 4. Aquário Particular & Bônus Passivos
* Transfira seus melhores espécimes para o aquário para ativar multiplicadores cumulativos de **+Ouro**, **+Sorte**, **+Velocidade de Pesca** e **+Pesca Dupla**.
* Filtros rápidos para organizar por raridade e automatizar a venda de espécies comuns com a peixaria automática.

### 📊 5. Sumário do Pescador & Sala de Troféus
* **Painel Completo de Estatísticas:** Acompanhe total de capturas, ouro vitalício, recorde do maior peixe fisgado, espécie mais frequente e ativações da Lua Sangrenta com ícones retrô em pixel art.
* **Enciclopédia de Pesca:** Descubra e catalogue todas as espécies para desbloquear a coleção completa.
* **Sala de Troféus:** 23 conquistas progressivas com recompensas e medalhas.

### ⛩️ 6. Santuário Místico & Meta-Progressão
* Doe espécies para os altares ancestrais para avançar ciclos de oferendas e desbloquear bônus permanentes da jornada.

---

## 📱 Instalação & Jogo Offline (PWA)

O Fish Clicker foi construído com arquitetura **Progressive Web App (PWA)**:
* 📲 **Instale em 1 Toque:** Adicione à tela inicial do celular ou desktop.
* 📺 **Modo Tela Cheia:** Experiência imersiva sem barras de navegador.
* ⚡ **100% Offline:** Jogue no avião, no metrô ou em viagens sem precisar de conexão com a internet.

---

## 🎮 Como Rodar Localmente

Caso queira executar ou testar o projeto no seu computador:

```bash
# 1. Clone o repositório
git clone https://github.com/StayFlinstons/fish-clicker.git

# 2. Acesse a pasta do projeto
cd fish-clicker

# 3. Inicie qualquer servidor HTTP estático
python -m http.server 8000
# ou com Node.js:
npx serve .
```

Abra no navegador: `http://localhost:8000`

---

## 🛠️ Tecnologias

* **HTML5 Canvas API:** Renderização procedural da água, partículas, pescador e peixes.
* **JavaScript Puro (ES6+ Modules):** Lógica direta, leve e sem dependências pesadas de frameworks.
* **Web Audio API:** Efeitos sonoros gerados por sintetizador procedural.
* **Tailwind CSS:** Layout responsivo e adaptável para telas móveis e ultrawide.
* **Service Worker:** Sistema de cache inteligente com estratégia Network-First e fallback offline.

---

<div align="center">
  Desenvolvido com carinho por <a href="https://github.com/StayFlinstons">StayFlinstons</a> 🎣✨<br>
  <b>Fish Clicker</b> — Licença MIT
</div>
