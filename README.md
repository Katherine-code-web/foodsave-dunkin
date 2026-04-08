# FoodSave — Dunkin Food Waste Analytics Platform

An interactive analytics platform that models food waste patterns, calculates ROI for waste reduction strategies, and provides AI-powered recommendations. Built from real operational insights at Dunkin (Boston University campus location).

**Business Impact:** Contributed to 12% waste reduction and 18% promotional ROI improvement over two quarters.

**[Live Demo](https://katherine-code-web.github.io/foodsave-dunkin/)**

---

## The Problem

Quick-service restaurants lose 8-12% of revenue to food waste annually. Most operators lack visibility into which items waste the most, when waste peaks occur, and which interventions deliver the best ROI. This platform turns raw waste data into actionable strategy.

---

## Features

| Page | What It Does |
|------|-------------|
| Dashboard | Simulates weekly waste for 21 Dunkin menu items with risk scoring, category breakdown, and ingredient-level analysis |
| ROI Calculator | Interactive sliders for 5 waste reduction strategies with real-time savings projection |
| Waste Input | Log daily waste records by item, track patterns over time |
| AI Analysis | Claude API-powered analysis that generates actionable recommendations |
| Setup | Configure restaurant profile |
| About | Methodology, data sources, and usage guide |

Supports English and Traditional Chinese.

---

## Quick Start

```bash
git clone https://github.com/Katherine-code-web/foodsave-dunkin.git
cd foodsave-dunkin
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| AI | Claude API (Anthropic) |
| Data | Custom simulation engine with Dunkin menu data (21 items, 35 ingredients) |
| Deployment | GitHub Pages |
| i18n | Custom bilingual system (EN/ZH) |

---

## Background

This project grew out of my role as Marketing Data Analyst at the Dunkin on Boston University campus, where I:
- Analyzed 12 weeks of POS transaction data to identify waste patterns
- Built an Excel-based labor demand model adopted by shift managers
- Modeled optimal reorder points in Python, sustaining 12% waste reduction
- Improved promotional ROI by 18% through data-driven campaign analysis

The platform translates those real-world insights into an interactive tool that any QSR operator can use.

---

## Author

**Yun-Ting Su** | Boston University MSBA (Expected Dec 2026)

[LinkedIn](https://linkedin.com/in/yun-ting-su-867b70364) | [GitHub](https://github.com/Katherine-code-web) | [Email](mailto:kt0704@bu.edu)
