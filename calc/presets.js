/*
  Пресеты ниш. Цены в USD (базовая валюта), калькулятор сам пересчитывает их в валюту языка.
  Тексты — ключи из i18n.js (label: "c_area" и т.п.). Для клиента можно писать текст прямо строкой.

  Типы полей:
    number   — число. price: цена за единицу. mult: true — итог умножается на значение (кол-во изделий).
    select   — выбор. В options: price (добавить к сумме) или mult (умножить итог).
    checkbox — галочка. price: добавить к сумме.
  perUnit: "id_поля" — цена умножается на значение этого числового поля (например, за м²).
*/
window.CALC_PRESETS = {
  ceilings: {
    tab: "tabCeil", title: "c_title", subtitle: "c_sub", note: "c_note", cta: "c_cta",
    accent: "#2f6fed", minTotal: 90,
    fields: [
      { id: "area", type: "number", label: "c_area", unit: "m2", min: 1, max: 300, step: 1, default: 18 },
      { id: "material", type: "select", label: "c_mat", perUnit: "area", options: [
        { label: "c_matte", price: 7 }, { label: "c_satin", price: 8 },
        { label: "c_gloss", price: 9 }, { label: "c_fabric", price: 18 }
      ]},
      { id: "lights", type: "number", label: "c_lights", unit: "pcs", min: 0, max: 50, step: 1, default: 4, price: 5 },
      { id: "pipes", type: "number", label: "c_pipes", unit: "pcs", min: 0, max: 20, step: 1, default: 0, price: 4 },
      { id: "cornice", type: "checkbox", label: "c_cornice", price: 35 },
      { id: "dismantle", type: "checkbox", label: "c_dism", price: 2, perUnit: "area" }
    ]
  },

  windows: {
    tab: "tabWin", title: "w_title", subtitle: "w_sub", note: "w_note", cta: "w_cta",
    accent: "#0f9d76", minTotal: 120,
    fields: [
      { id: "type", type: "select", label: "w_type", options: [
        { label: "w_1", price: 130 }, { label: "w_2", price: 220 },
        { label: "w_3", price: 310 }, { label: "w_bal", price: 400 }
      ]},
      { id: "qty", type: "number", label: "w_qty", unit: "pcs", min: 1, max: 30, step: 1, default: 1, mult: true },
      { id: "profile", type: "select", label: "w_prof", options: [
        { label: "w_eco", mult: 1 }, { label: "w_std", mult: 1.2 }, { label: "w_prem", mult: 1.5 }
      ]},
      { id: "glass", type: "select", label: "w_glass", options: [
        { label: "w_g1", mult: 1 }, { label: "w_g2", mult: 1.15 }
      ]},
      { id: "sill", type: "checkbox", label: "w_sill", price: 25 },
      { id: "slopes", type: "checkbox", label: "w_slopes", price: 35 },
      { id: "net", type: "checkbox", label: "w_net", price: 12 },
      { id: "mount", type: "checkbox", label: "w_mount", price: 40, default: true }
    ]
  },

  cleaning: {
    tab: "tabClean", title: "k_title", subtitle: "k_sub", note: "k_note", cta: "k_cta",
    accent: "#7b4fe0", minTotal: 35,
    fields: [
      { id: "area", type: "number", label: "k_area", unit: "m2", min: 10, max: 400, step: 1, default: 50 },
      { id: "kind", type: "select", label: "k_kind", perUnit: "area", options: [
        { label: "k_light", price: 1 }, { label: "k_deep", price: 1.7 }, { label: "k_reno", price: 2.4 }
      ]},
      { id: "windows", type: "number", label: "k_win", unit: "sash", min: 0, max: 40, step: 1, default: 0, price: 4 },
      { id: "fridge", type: "checkbox", label: "k_fridge", price: 12 },
      { id: "oven", type: "checkbox", label: "k_oven", price: 10 },
      { id: "balcony", type: "checkbox", label: "k_balc", price: 15 }
    ]
  },

  repair: {
    tab: "tabRep", title: "r_title", subtitle: "r_sub", note: "r_note", cta: "r_cta",
    accent: "#e0682f", minTotal: 600,
    fields: [
      { id: "area", type: "number", label: "r_area", unit: "m2", min: 5, max: 500, step: 1, default: 45 },
      { id: "kind", type: "select", label: "r_kind", perUnit: "area", options: [
        { label: "r_cosm", price: 50 }, { label: "r_cap", price: 100 }, { label: "r_des", price: 160 }
      ]},
      { id: "electric", type: "checkbox", label: "r_elec", price: 12, perUnit: "area" },
      { id: "plumbing", type: "checkbox", label: "r_plumb", price: 420 },
      { id: "demolition", type: "checkbox", label: "r_demo", price: 9, perUnit: "area" },
      { id: "trash", type: "checkbox", label: "r_trash", price: 70 }
    ]
  }
};
