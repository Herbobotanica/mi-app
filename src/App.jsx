import { useState, useEffect } from "react";

const STORAGE_KEY = "herbo_v2"; // same key, migrates data
const genId = () => Math.random().toString(36).slice(2, 9);
const fmt = (n, d = 2) => typeof n === "number" ? n.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const fmtARS = n => `$ ${fmt(n)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtF = s => s ? new Date(s + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";
const diasDesde = s => s ? Math.floor((Date.now() - new Date(s + "T12:00:00")) / 86400000) : null;

const getWeekRange = () => {
  const n = new Date(); const day = n.getDay();
  const mon = new Date(n); mon.setDate(n.getDate() - (day === 0 ? 6 : day - 1)); mon.setHours(0,0,0,0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  return { start: mon, end: sun };
};

const RECETAS_CATALOGO = [
  {id:"aceitee_BER",nombre:"Aceite esencial de Bergamota",sku:"HB-HOME-AE-BER",categoria:"Home",costoTotal:2101.4,ingredientes:[{insumo:"Aceite Esencial de Bergamota",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:141.4,costoTotal:1414.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_LAV",nombre:"Aceite esencial de Lavanda",sku:"HB-HOME-AE-LAV",categoria:"Home",costoTotal:2221.2,ingredientes:[{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:153.38,costoTotal:1533.8},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"brumaar_ARS",nombre:"Bruma Aroma Sagrado",sku:"HB-HUM-BRU-ARS",categoria:"Home",costoTotal:1740.61,ingredientes:[{insumo:"Aceite Esencial de Bergamota",proveedor:"",unidad:"mililitros",cantidad:0.4,costoUnitario:141.4,costoTotal:56.56},{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:0.4,costoUnitario:153.38,costoTotal:61.352},{insumo:"Aceite Esencial de Rosas",proveedor:"",unidad:"mililitros",cantidad:0.7,costoUnitario:171.0,costoTotal:119.7},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:60.0,costoUnitario:0.65,costoTotal:39.0},{insumo:"Atomizador enfundado plata/oro para Bruma",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:750.0,costoTotal:750.0},{insumo:"Envase Bruma Aurica pet cristal x 60 ml + atomizador",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:644.0,costoTotal:644.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"brumadu_DLS",nombre:"Bruma Dulces Sueños",sku:"HB-HUM-BRU-DLS",categoria:"Home",costoTotal:1007.19,ingredientes:[{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:0.5,costoUnitario:153.38,costoTotal:76.69},{insumo:"Aceite Esencial de Menta",proveedor:"",unidad:"mililitros",cantidad:0.7,costoUnitario:225.0,costoTotal:157.5},{insumo:"Aceite Esencial de Naranja",proveedor:"",unidad:"mililitros",cantidad:0.2,costoUnitario:100.0,costoTotal:20.0},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:60.0,costoUnitario:0.65,costoTotal:39.0},{insumo:"Envase Bruma Aurica pet cristal x 60 ml + atomizador",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:644.0,costoTotal:644.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"brumali_LIM",nombre:"Bruma Limpieza Áurica",sku:"HB-HUM-BRU-LIM",categoria:"Home",costoTotal:1664.4,ingredientes:[{insumo:"Aceite Esencial de Bergamota",proveedor:"",unidad:"mililitros",cantidad:1.0,costoUnitario:141.4,costoTotal:141.4},{insumo:"Aceite Esencial de Naranja",proveedor:"",unidad:"mililitros",cantidad:0.2,costoUnitario:100.0,costoTotal:20.0},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:60.0,costoUnitario:0.65,costoTotal:39.0},{insumo:"Atomizador enfundado plata/oro para Bruma",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:750.0,costoTotal:750.0},{insumo:"Envase Bruma Aurica pet cristal x 60 ml + atomizador",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:644.0,costoTotal:644.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"chemistr_CHE",nombre:"Chemistry Herbal - Difusor para Aceites Esenciales & Esencias",sku:"HB-HOME-CHE",categoria:"Home",costoTotal:15583.6,ingredientes:[{insumo:"Balon de 100 ml pirex",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:8421.6,costoTotal:8421.6},{insumo:"Tripode Metal + base cemento",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:3800.0,costoTotal:3800.0},{insumo:"Vaso Precipitado x 25 ml",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:2668.0,costoTotal:2668.0},{insumo:"Vela de noche x 12 unidades",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:694.0,costoTotal:694.0}]},
  {id:"chemistr_CHE",nombre:"Chemistry Herbal - Difusor para Aceites Esenciales & Esencias  (Con Trío Esencias de Hornillo)",sku:"HB-HOME-CHE",categoria:"Home",costoTotal:19921.7,ingredientes:[{insumo:"Balon de 100 ml pirex",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:8421.6,costoTotal:8421.6},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:3.0,costoUnitario:70.0,costoTotal:210.0},{insumo:"Frasco Euro 10 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"Unidad",cantidad:3.0,costoUnitario:814.5,costoTotal:2443.5},{insumo:"Londres",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:16.82,costoTotal:168.2},{insumo:"Malasia",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:50.73,costoTotal:507.3},{insumo:"Tahithí",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:170.31,costoTotal:1703.1},{insumo:"Tripode Metal + base cemento",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:3800.0,costoTotal:3800.0},{insumo:"Vaso Precipitado x 25 ml",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:2668.0,costoTotal:2668.0}]},
  {id:"chemistr_CHE",nombre:"Chemistry Herbal - Difusor para Aceites Esenciales & Esencias Con Trio Aceites Esenciales)",sku:"HB-HOME-CHE",categoria:"Home",costoTotal:21843.6,ingredientes:[{insumo:"Aceite Esencial de Bergamota",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:141.4,costoTotal:1414.0},{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:153.38,costoTotal:1533.8},{insumo:"Aceite Esencial de Romero",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:125.0,costoTotal:1250.0},{insumo:"Balon de 100 ml pirex",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:8421.6,costoTotal:8421.6},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:3.0,costoUnitario:70.0,costoTotal:210.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:3.0,costoUnitario:617.4,costoTotal:1852.2},{insumo:"Tripode Metal + base cemento",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:3800.0,costoTotal:3800.0},{insumo:"Vaso Precipitado x 25 ml",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:2668.0,costoTotal:2668.0},{insumo:"Vela de noche x 12 unidades",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:694.0,costoTotal:694.0}]},
  {id:"esencia_TUL",nombre:"Esencia para Difusor - Jardines de Praga",sku:"HB-HOME-DIF-TUL",categoria:"Home",costoTotal:5899.75,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:187.0,costoUnitario:0.65,costoTotal:121.55},{insumo:"Envase Pet Omega Cristal x 250 ml + tapa difusora",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:740.0,costoTotal:740.0},{insumo:"Esencia Pura de Neroli",proveedor:"",unidad:"Mililitro",cantidad:60.0,costoUnitario:82.85,costoTotal:4971.0},{insumo:"Varillas de Ratan",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:67.2,costoTotal:67.2}]},
  {id:"esencia_TUL",nombre:"Esencia para Difusor - Jardín de Tullerías",sku:"HB-HOME-DIF-TUL",categoria:"Home",costoTotal:4271.13,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:195.0,costoUnitario:0.65,costoTotal:126.75},{insumo:"Envase Pet Omega Cristal x 250 ml + tapa difusora",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:740.0,costoTotal:740.0},{insumo:"Esencia Difusor - Hibiscus",proveedor:"",unidad:"mililitros",cantidad:63.0,costoUnitario:51.86,costoTotal:3267.18},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Varillas de Ratan",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:67.2,costoTotal:67.2}]},
  {id:"esencia_HAB",nombre:"Esencia para Difusor - Noche en La Habana",sku:"HB-HOME-DIF-HAB",categoria:"Home",costoTotal:3256.11,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:180.0,costoUnitario:0.65,costoTotal:117.0},{insumo:"Envase Pet Omega Cristal x 250 ml + tapa difusora",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:740.0,costoTotal:740.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Ruda, Clavo, Canela",proveedor:"",unidad:"mililitros",cantidad:63.0,costoUnitario:36.97,costoTotal:2329.11}]},
  {id:"esencia_TIL",nombre:"Esencia para Difusor - Valle de Tilcara",sku:"HB-HOME-DIF-TIL",categoria:"Home",costoTotal:1866.53,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:190.0,costoUnitario:0.65,costoTotal:123.5},{insumo:"Envase Pet Omega Cristal x 250 ml + tapa difusora",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:740.0,costoTotal:740.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Tabaco Rubio",proveedor:"",unidad:"Mililitros",cantidad:63.0,costoUnitario:14.81,costoTotal:933.03}]},
  {id:"esencia_LON",nombre:"Esencia para Hornillos - Flora",sku:"HB-HOME-EH-LON",categoria:"Home",costoTotal:1806.94,ingredientes:[{insumo:"Aceite Esencial de Jazmin",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:140.0,costoTotal:280.0},{insumo:"Esencia Pura de Bergamota",proveedor:"",unidad:"Mililitro",cantidad:4.0,costoUnitario:80.69,costoTotal:322.76},{insumo:"Esencia Pura de Rosa",proveedor:"",unidad:"Mililitro",cantidad:4.0,costoUnitario:79.92,costoTotal:319.68},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:814.5,costoTotal:814.5}]},
  {id:"esencia_LON",nombre:"Esencia para Hornillos - Londres",sku:"HB-HOME-EH-LON",categoria:"Home",costoTotal:1052.7,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:814.5,costoTotal:814.5},{insumo:"Londres",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:16.82,costoTotal:168.2}]},
  {id:"esencia_MAL",nombre:"Esencia para Hornillos - Malasia",sku:"HB-HOME-EH-MAL",categoria:"Home",costoTotal:1391.8,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:814.5,costoTotal:814.5},{insumo:"Malasia",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:50.73,costoTotal:507.3}]},
  {id:"esencia_OAS",nombre:"Esencia para Hornillos - Oasis",sku:"HB-HOME-ESH-OAS",categoria:"Home",costoTotal:1609.98,ingredientes:[{insumo:"Esencia Pura de Lavanda",proveedor:"",unidad:"Mililitro",cantidad:4.0,costoUnitario:65.68,costoTotal:262.72},{insumo:"Esencia Pura de Neroli",proveedor:"",unidad:"Mililitro",cantidad:4.0,costoUnitario:82.85,costoTotal:331.4},{insumo:"Esencia Pura de Pomelo",proveedor:"",unidad:"Mililitro",cantidad:2.0,costoUnitario:65.68,costoTotal:131.36},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:814.5,costoTotal:814.5}]},
  {id:"esencia_TAH",nombre:"Esencia para Hornillos - Tahiti",sku:"HB-HOME-EH-TAH",categoria:"Home",costoTotal:2587.6,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:814.5,costoTotal:814.5},{insumo:"Tahithí",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:170.31,costoTotal:1703.1}]},
  {id:"esencia_TAH",nombre:"Esencia para Hornillos - Tierra",sku:"HB-HOME-EH-TAH",categoria:"Home",costoTotal:1594.94,ingredientes:[{insumo:"Esencia Pura de CafÃ©",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:62.5,costoTotal:312.5},{insumo:"Esencia Pura de Jenjibre",proveedor:"",unidad:"Mililitro",cantidad:1.2,costoUnitario:80.68,costoTotal:96.816},{insumo:"Esencia Pura de Neroli",proveedor:"",unidad:"Mililitro",cantidad:1.2,costoUnitario:82.85,costoTotal:99.42},{insumo:"Esencia Pura de Vainilla",proveedor:"",unidad:"Mililitro",cantidad:2.5,costoUnitario:80.68,costoTotal:201.7},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:814.5,costoTotal:814.5}]},
  {id:"londres_LON",nombre:"Londres - Vela de Soja - Té negro, Moras & Canela",sku:"HB-HOME-VL-LON",categoria:"Home",costoTotal:8185.0,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Fabricación Vela - Laboratorio de Aromas",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:6900.0,costoTotal:6900.0},{insumo:"Pote ambar 100 ml con tapa plateada",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:1215.0,costoTotal:1215.0}]},
  {id:"sprayho_MAR",nombre:"Spray Home Bazares de Marruecos",sku:"HB-HOME-SH-MAR",categoria:"Home",costoTotal:1707.8,ingredientes:[{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:10.0,costoUnitario:1.57,costoTotal:15.7},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:160.0,costoUnitario:0.65,costoTotal:104.0},{insumo:"Envase Pet Spray Home - Heaven 200 ml",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:850.0,costoTotal:850.0},{insumo:"Esencia Java - Spray Home",proveedor:"",unidad:"mililitros",cantidad:15.0,costoUnitario:44.54,costoTotal:668.1},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"sprayho_CEN",nombre:"Spray Home Cenote Escondido",sku:"HB-HOME-SH-CEN",categoria:"Home",costoTotal:1254.35,ingredientes:[{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:10.0,costoUnitario:1.57,costoTotal:15.7},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:160.0,costoUnitario:0.65,costoTotal:104.0},{insumo:"Envase Pet Spray Home - Heaven 200 ml",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:850.0,costoTotal:850.0},{insumo:"Esencia Spray Home Canela, Vainila y Tabaco",proveedor:"",unidad:"mililitros",cantidad:15.0,costoUnitario:14.31,costoTotal:214.65},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"sprayho_BAL",nombre:"Spray Home Flores de Bali",sku:"HB-HOME-SP-BAL",categoria:"Home",costoTotal:3278.25,ingredientes:[{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:75.0,costoUnitario:1.57,costoTotal:117.75},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:1170.0,costoUnitario:0.65,costoTotal:760.5},{insumo:"Envase Aluminio Roma x 150 ml",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:1289.0,costoTotal:1289.0},{insumo:"Gatillo Mini Trigger rosca 24 negro",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:880.0,costoTotal:880.0},{insumo:"Tarde de Otoño",proveedor:"",unidad:"mililitros",cantidad:11.0,costoUnitario:21.0,costoTotal:231.0}]},
  {id:"sprayho_VER",nombre:"Spray Home Jardines de Praga",sku:"HB-HOME-SH-VER",categoria:"Home",costoTotal:3488.22,ingredientes:[{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:10.0,costoUnitario:1.57,costoTotal:15.7},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:160.0,costoUnitario:0.65,costoTotal:104.0},{insumo:"Envase Aluminio Roma x 150 ml",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:1289.0,costoTotal:1289.0},{insumo:"Esencia Pura de Jenjibre",proveedor:"",unidad:"Mililitro",cantidad:14.0,costoUnitario:80.68,costoTotal:1129.52},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Gatillo Mini Trigger rosca 24 negro",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:880.0,costoTotal:880.0}]},
  {id:"sprayho_VER",nombre:"Spray Home Jardines de Versalles",sku:"HB-HOME-SH-VER",categoria:"Home",costoTotal:1430.52,ingredientes:[{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:10.0,costoUnitario:1.57,costoTotal:15.7},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:158.0,costoUnitario:0.65,costoTotal:102.7},{insumo:"Envase Pet Spray Home - Heaven 200 ml",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:850.0,costoTotal:850.0},{insumo:"Esencia Aphrodita Spray Home",proveedor:"",unidad:"mililitros",cantidad:14.5,costoUnitario:31.87,costoTotal:462.115}]},
  {id:"aceitee_172",nombre:"Aceite Esencial de Citronela",sku:"HEB-172",categoria:"Humans",costoTotal:1941.4,ingredientes:[{insumo:"Aceite Esencial de Citronella",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:125.4,costoTotal:1254.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_070",nombre:"Aceite esencial de Eucaliptus",sku:"HEB-070",categoria:"Humans",costoTotal:1836.4,ingredientes:[{insumo:"Aceite Esencial de Eucaliptos",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:114.9,costoTotal:1149.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_068",nombre:"Aceite esencial de Jazmín",sku:"HEB-068",categoria:"Humans",costoTotal:2087.4,ingredientes:[{insumo:"Aceite Esencial de Jazmin",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:140.0,costoTotal:1400.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_063",nombre:"Aceite esencial de Limón",sku:"HEB-063",categoria:"Humans",costoTotal:2187.4,ingredientes:[{insumo:"Aceite Esencial de Limón",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:150.0,costoTotal:1500.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_065",nombre:"Aceite esencial de Menta",sku:"HEB-065",categoria:"Humans",costoTotal:2937.4,ingredientes:[{insumo:"Aceite Esencial de Menta",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:225.0,costoTotal:2250.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_064",nombre:"Aceite esencial de Naranja",sku:"HEB-064",categoria:"Humans",costoTotal:1687.4,ingredientes:[{insumo:"Aceite Esencial de Naranja",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:100.0,costoTotal:1000.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_071",nombre:"Aceite esencial de Romero",sku:"HEB-071",categoria:"Humans",costoTotal:1937.4,ingredientes:[{insumo:"Aceite Esencial de Romero",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:125.0,costoTotal:1250.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_172",nombre:"Aceite esencial de Rosas",sku:"HEB-172",categoria:"Humans",costoTotal:2397.4,ingredientes:[{insumo:"Aceite Esencial de Rosas",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:10.0,costoUnitario:171.0,costoTotal:1710.0},{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"Frascarg",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aceitee_066",nombre:"Aceite esencial de Tea Tree",sku:"HEB-066",categoria:"Humans",costoTotal:2748.2,ingredientes:[{insumo:"Aceite Esencial de Tea Tree",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:10.0,costoUnitario:206.08,costoTotal:2060.8},{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml ambar con precinto",proveedor:"Frascarg",unidad:"Unidad",cantidad:1.0,costoUnitario:617.4,costoTotal:617.4}]},
  {id:"aguade_AGR",nombre:"Agua de Rosas",sku:"HB-HUM-BRU-AGR",categoria:"Humans",costoTotal:2242.86,ingredientes:[{insumo:"Agua de Rosas",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:250.0,costoUnitario:6.74,costoTotal:1685.0},{insumo:"Envase Omega x 250ml AMBAR con atomizador negro",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:487.86,costoTotal:487.86},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"agüitas_AYA",nombre:"Agüita Sagrada Amor & Armonía",sku:"HB-HUM-AGU-AYA",categoria:"Humans",costoTotal:1973.94,ingredientes:[{insumo:"Aceite Esencial de Bergamota",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.6,costoUnitario:141.4,costoTotal:84.84},{insumo:"Aceite Esencial de Jazmin",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.6,costoUnitario:140.0,costoTotal:84.0},{insumo:"Aceite Esencial de Rosas",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.6,costoUnitario:171.0,costoTotal:102.6},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:50.0,costoUnitario:0.65,costoTotal:32.5},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Tubo Cristal x 50 ml + enfudado dorado  R18",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:1600.0,costoTotal:1600.0}]},
  {id:"agüitas_CYR",nombre:"Agüita Sagrada Calma & Relajación",sku:"HB-HUM-AGU-CYR",categoria:"Humans",costoTotal:1821.38,ingredientes:[{insumo:"Aceite Esencial de Cipre",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.15,costoUnitario:108.0,costoTotal:16.2},{insumo:"Aceite Esencial de Jazmin",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.35,costoUnitario:140.0,costoTotal:49.0},{insumo:"Aceite Esencial de Lavanda",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.35,costoUnitario:153.38,costoTotal:53.683},{insumo:"Alcohol de Cereal",proveedor:"Adecolab",unidad:"mililitro",cantidad:50.0,costoUnitario:0.65,costoTotal:32.5},{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Tubo Cristal x 50 ml + enfudado dorado  R18",proveedor:"Megaenvases",unidad:"Unidad",cantidad:1.0,costoUnitario:1600.0,costoTotal:1600.0}]},
  {id:"agüitas_LYP",nombre:"Agüita Sagrada de Limpieza & Protección",sku:"HB-HUM-AGU-LYP",categoria:"Humans",costoTotal:1804.42,ingredientes:[{insumo:"Aceite Esencial de Bergamota",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.15,costoUnitario:141.4,costoTotal:21.21},{insumo:"Aceite Esencial de Clavo de olor",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.01,costoUnitario:270.0,costoTotal:2.7},{insumo:"Aceite Esencial de Lavanda",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.15,costoUnitario:153.38,costoTotal:23.007},{insumo:"Aceite Esencial de Limón",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.1,costoUnitario:150.0,costoTotal:15.0},{insumo:"Aceite Esencial de Menta",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.05,costoUnitario:225.0,costoTotal:11.25},{insumo:"Aceite Esencial de Naranja",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.1,costoUnitario:100.0,costoTotal:10.0},{insumo:"Aceite Esencial de Romero",proveedor:"Química Eiffel",unidad:"mililitros",cantidad:0.15,costoUnitario:125.0,costoTotal:18.75},{insumo:"Alcohol de Cereal",proveedor:"Adecolab",unidad:"mililitro",cantidad:50.0,costoUnitario:0.65,costoTotal:32.5},{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Tubo Cristal x 50 ml + enfudado dorado  R18",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:1600.0,costoTotal:1600.0}]},
  {id:"aveféni_AVE",nombre:"Ave Fénix - Fórmula Floral para Tristeza y Depresión",sku:"HB-HUM-FL-AVE",categoria:"Humans",costoTotal:1008.68,ingredientes:[{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de Bush",proveedor:"",unidad:"dosis",cantidad:1.0,costoUnitario:103.68,costoTotal:103.68},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:5.0,costoUnitario:34.76,costoTotal:173.8},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"Frascarg",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"bellani_067",nombre:"Bella Ninfa: Potencia femenina",sku:"HEB-067",categoria:"Humans",costoTotal:1441.0,ingredientes:[{insumo:"Aceite Esencial de Rosas",proveedor:"",unidad:"mililitros",cantidad:1.0,costoUnitario:171.0,costoTotal:171.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Jupiter Sales",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:700.0,costoTotal:700.0},{insumo:"Hierbas",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:500.0,costoTotal:500.0}]},
  {id:"bodyoil_AFR",nombre:"Body Oil - Afrodita",sku:"HB-HUM-BOD-AFR",categoria:"Humans",costoTotal:1403.08,ingredientes:[{insumo:"Aceite de Almendras",proveedor:"",unidad:"Litro",cantidad:0.01,costoUnitario:11030.4,costoTotal:110.304},{insumo:"Aceite Esencial de Bergamota",proveedor:"",unidad:"mililitros",cantidad:0.7,costoUnitario:141.4,costoTotal:98.98},{insumo:"Aceite Esencial de Jazmin",proveedor:"",unidad:"mililitros",cantidad:0.3,costoUnitario:140.0,costoTotal:42.0},{insumo:"Aceite Esencial de Rosas",proveedor:"",unidad:"mililitros",cantidad:0.8,costoUnitario:171.0,costoTotal:136.8},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:945.0,costoTotal:945.0}]},
  {id:"bodyoil_CAL",nombre:"Body Oil - Calma",sku:"HB-HUM-BOD-CAL",categoria:"Humans",costoTotal:1740.18,ingredientes:[{insumo:"Aceite de Almendras",proveedor:"",unidad:"Litro",cantidad:0.03,costoUnitario:11030.4,costoTotal:330.912},{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:0.7,costoUnitario:153.38,costoTotal:107.366},{insumo:"Aceite Esencial de Menta",proveedor:"",unidad:"mililitros",cantidad:0.7,costoUnitario:225.0,costoTotal:157.5},{insumo:"Aceite Esencial de Naranja",proveedor:"",unidad:"mililitros",cantidad:0.5,costoUnitario:100.0,costoTotal:50.0},{insumo:"Aceite Esencial de Neroli",proveedor:"",unidad:"mililitros",cantidad:0.5,costoUnitario:158.8,costoTotal:79.4},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml cristal con tapa dorada y gotero blanco",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:945.0,costoTotal:945.0}]},
  {id:"burnout_BUR",nombre:"Burnout - Fórmula Floral para el agotamiento",sku:"HB-HUM-FL-BUR",categoria:"Humans",costoTotal:1070.76,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Stock Bottle Bach",proveedor:"",unidad:"Gotas x 2",cantidad:3.0,costoUnitario:34.76,costoTotal:104.28},{insumo:"Stock Bottle Bush",proveedor:"",unidad:"Gotas x 7",cantidad:1.0,costoUnitario:131.0,costoTotal:131.0},{insumo:"Stock Bottle California",proveedor:"",unidad:"Gotas x 2",cantidad:3.0,costoUnitario:34.76,costoTotal:104.28},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"concretu_CON",nombre:"Concretum - Fórmula para el foco y la constancia",sku:"HB-HUM-FL-CON",categoria:"Humans",costoTotal:945.0,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:5.0,costoUnitario:34.76,costoTotal:173.8},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Stock Bottle Saint Germain",proveedor:"",unidad:"Gotas x 2",cantidad:1.0,costoUnitario:40.0,costoTotal:40.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"embarazo_EMB",nombre:"Embarazo - Fórmula Floral",sku:"HB-HUM-FL-EMB",categoria:"Humans",costoTotal:1043.44,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de Bush",proveedor:"",unidad:"dosis",cantidad:1.0,costoUnitario:103.68,costoTotal:103.68},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:6.0,costoUnitario:34.76,costoTotal:208.56},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"emergenc_EME",nombre:"Emergency - Spray de Rescate",sku:"HB-HUM-FL-EME",categoria:"Humans",costoTotal:1045.96,ingredientes:[{insumo:"Envase Tubo x 20 ml ambar + srpay R/18",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:662.4,costoTotal:662.4},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:1.0,costoUnitario:34.76,costoTotal:34.76},{insumo:"Stock Bottle Saint Germain",proveedor:"",unidad:"Gotas x 2",cantidad:2.0,costoUnitario:40.0,costoTotal:80.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:20.0,costoUnitario:13.44,costoTotal:268.8}]},
  {id:"fertilid_FER",nombre:"Fertilidad - Fórmula Floral",sku:"HB-HUM-FL-FER",categoria:"Humans",costoTotal:1070.76,ingredientes:[{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:6.0,costoUnitario:34.76,costoTotal:208.56},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Stock Bottle Bush",proveedor:"Laboratorio Floral",unidad:"Gotas x 7",cantidad:1.0,costoUnitario:131.0,costoTotal:131.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"fórmula_DYR",nombre:"Fórmula Floral Vincular Duelos & Rupturas",sku:"HB-HUM-FL-DYR",categoria:"Humans",costoTotal:1035.7,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de Bush",proveedor:"",unidad:"dosis",cantidad:2.0,costoUnitario:103.68,costoTotal:207.36},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:4.0,costoUnitario:34.76,costoTotal:139.04},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:5.0,costoUnitario:5.06,costoTotal:25.3}]},
  {id:"líneaci_EMB",nombre:"Línea Ciclos: Embarazo - Fórmula Floral",sku:"HB-HUM-FL-EMB",categoria:"Humans",costoTotal:957.92,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"líneaci_FER",nombre:"Línea Ciclos: Fertilidad - Fórmula Floral",sku:"HB-HUM-FL-FER",categoria:"Humans",costoTotal:1041.72,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:10.0,costoUnitario:13.44,costoTotal:134.4}]},
  {id:"líneaci_MEN",nombre:"Línea Ciclos: Menopausia - Fórmula Floral",sku:"HB-HUM-FL-MEN",categoria:"Humans",costoTotal:1041.72,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:10.0,costoUnitario:13.44,costoTotal:134.4}]},
  {id:"menopaus_MEN",nombre:"Menopausia - Fórmula Floral",sku:"HB-HUM-FL-MEN",categoria:"Humans",costoTotal:1070.76,ingredientes:[{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"Frascarg",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Stock Bottle Bach",proveedor:"Londers",unidad:"Gotas x 2",cantidad:4.0,costoUnitario:34.76,costoTotal:139.04},{insumo:"Stock Bottle Bush",proveedor:"",unidad:"Gotas x 7",cantidad:1.0,costoUnitario:131.0,costoTotal:131.0},{insumo:"Stock Bottle California",proveedor:"Londers",unidad:"Gotas x 2",cantidad:2.0,costoUnitario:34.76,costoTotal:69.52},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"rescuer_-RR",nombre:"Rescue Remedy - Remedio de Rescate Bach",sku:"HB-HUM-FL-RR",categoria:"Humans",costoTotal:731.2,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"rollon_SER",nombre:"Roll On Serenity",sku:"HB-HUM-BOD-SER",categoria:"Humans",costoTotal:1534.45,ingredientes:[{insumo:"Aceite de Almendras",proveedor:"",unidad:"Litro",cantidad:0.005,costoUnitario:11030.4,costoTotal:55.152},{insumo:"Aceite de Ricino",proveedor:"",unidad:"mililitros",cantidad:5.0,costoUnitario:14.7,costoTotal:73.5},{insumo:"Aceite Esencial de Bergamota",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:141.4,costoTotal:282.8},{insumo:"Aceite Esencial de Clavo de olor",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:270.0,costoTotal:540.0},{insumo:"Brillo Labial - Roll On",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:513.0,costoTotal:513.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"santoan_SAN",nombre:"Santo Ansilius - Flores de Bach para la ansiedad",sku:"HB-HUM-FL-SAN",categoria:"Humans",costoTotal:974.52,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:5.0,costoUnitario:13.44,costoTotal:67.2}]},
  {id:"sprayfl_EXA",nombre:"Spray Floral Exámenes",sku:"HB-HUM-FL-EXA",categoria:"Humans",costoTotal:1174.52,ingredientes:[{insumo:"Envase Tubo x 20 ml ambar + srpay R/18",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:662.4,costoTotal:662.4},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Vodka - Smirnoff",proveedor:"",unidad:"Mililitro",cantidad:20.0,costoUnitario:13.44,costoTotal:268.8}]},
  {id:"tónicoh_-CM",nombre:"Tónico Herbal - Ciclo Menstrual",sku:"HB-HUM-TON-CM",categoria:"Humans",costoTotal:1028.2,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:30.0,costoUnitario:0.65,costoTotal:19.5},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Raiz de Valeriana",proveedor:"",unidad:"mililitros",cantidad:30.0,costoUnitario:11.49,costoTotal:344.7}]},
  {id:"tónicoh_D&D",nombre:"Tónico Herbal - Digestivo y Depurativo",sku:"HB-HUM-TON-D&D",categoria:"Humans",costoTotal:1028.2,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:30.0,costoUnitario:0.65,costoTotal:19.5},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Raiz de Valeriana",proveedor:"",unidad:"mililitros",cantidad:30.0,costoUnitario:11.49,costoTotal:344.7}]},
  {id:"tónicoh_EST",nombre:"Tónico Herbal - Estrés y Ansiedad",sku:"HB-HUM-TON-EST",categoria:"Humans",costoTotal:1028.2,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:30.0,costoUnitario:0.65,costoTotal:19.5},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 30 ml ambar con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Raiz de Valeriana",proveedor:"",unidad:"mililitros",cantidad:30.0,costoUnitario:11.49,costoTotal:344.7}]},
  {id:"brumaáu_GUA",nombre:"Bruma Áurica Guardián de Sueños - KIDS | Variante Única",sku:"HB-KIDS-BRU-GUA",categoria:"Kids",costoTotal:1362.18,ingredientes:[{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:1.0,costoUnitario:153.38,costoTotal:153.38},{insumo:"Aceite Esencial de Neroli",proveedor:"",unidad:"mililitros",cantidad:1.0,costoUnitario:158.8,costoTotal:158.8},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:200.0,costoUnitario:0.65,costoTotal:130.0},{insumo:"Envase Pet Spray Home - Heaven 200 ml",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:850.0,costoTotal:850.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0}]},
  {id:"bálsamo_BAL",nombre:"Bálsamo Respira & Descongestiona - KIDS",sku:"HB-KIDS-BOT-BAL",categoria:"Kids",costoTotal:1719.35,ingredientes:[{insumo:"Aceite Esencial de Eucaliptos",proveedor:"",unidad:"mililitros",cantidad:1.5,costoUnitario:114.9,costoTotal:172.35},{insumo:"Aceite Esencial de Menta",proveedor:"",unidad:"mililitros",cantidad:1.0,costoUnitario:225.0,costoTotal:225.0},{insumo:"Cera de Abeja",proveedor:"",unidad:"gramos",cantidad:2.0,costoUnitario:27.0,costoTotal:54.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Lata Pastillero Balsamo",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:350.0,costoTotal:350.0},{insumo:"Manteca de Karite",proveedor:"",unidad:"gramos",cantidad:20.0,costoUnitario:28.7,costoTotal:574.0},{insumo:"Oleato de Caléndula",proveedor:"",unidad:"mililitros",cantidad:20.0,costoUnitario:13.7,costoTotal:274.0}]},
  {id:"fórmula_ADA",nombre:"Fórmula Floral Adaptación a cambios - KIDS",sku:"HB-KIDS-FL-ADA",categoria:"Kids",costoTotal:957.92,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml azul con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_AUT",nombre:"Fórmula Floral Autoestima & Seguridad - KIDS",sku:"HB-KIDS-FL-AUT",categoria:"Kids",costoTotal:957.92,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml azul con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_BER",nombre:"Fórmula Floral Berrinches & Rebeldía - KIDS",sku:"HB-KIDS-FL-BER",categoria:"Kids",costoTotal:957.92,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml azul con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_HIP",nombre:"Fórmula Floral Hiperactividad & Atención - KIDS",sku:"HB-KIDS-FL-HIP",categoria:"Kids",costoTotal:1201.24,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:14.0,costoUnitario:34.76,costoTotal:486.64},{insumo:"Frasco Euro 30 ml azul con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_-RR",nombre:"Fórmula Floral Rescue Remedy - KIDS",sku:"HB-KIDS-FL-RR",categoria:"Kids",costoTotal:784.12,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:2.0,costoUnitario:34.76,costoTotal:69.52},{insumo:"Frasco Euro 30 ml azul con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_TER",nombre:"Fórmula Floral Terrores Nocturnos - KIDS",sku:"HB-KIDS-FL-TER",categoria:"Kids",costoTotal:957.92,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml azul con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:594.0,costoTotal:594.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"sprayte_ANG",nombre:"Spray Textil Suspiros de Ángel - KIDS",sku:"HB-KIDS-SH-ANG",categoria:"Kids",costoTotal:1363.2,ingredientes:[{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:180.0,costoUnitario:0.65,costoTotal:117.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Gatillo Mini Trigger rosca 24 negro",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:880.0,costoTotal:880.0},{insumo:"Tabaco Rubio",proveedor:"",unidad:"Mililitros",cantidad:20.0,costoUnitario:14.81,costoTotal:296.2}]},
  {id:"brumaal_ALM",nombre:"Bruma Alma Serena - Pets",sku:"HB-PET-BRU-ALM",categoria:"Pets",costoTotal:628.11,ingredientes:[{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:0.3,costoUnitario:153.38,costoTotal:46.014},{insumo:"Aceite Esencial de Neroli",proveedor:"",unidad:"mililitros",cantidad:0.3,costoUnitario:158.8,costoTotal:47.64},{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:20.0,costoUnitario:1.57,costoTotal:31.4},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:20.0,costoUnitario:0.65,costoTotal:13.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Hidrolato de Lavanda",proveedor:"",unidad:"mililitros",cantidad:20.0,costoUnitario:5.1,costoTotal:102.0},{insumo:"Ro ambar 60 ml + atomizador Negro",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:318.06,costoTotal:318.06}]},
  {id:"brumaby_BYE",nombre:"Bruma Bye Bye Miedo - Pets | Variante Única",sku:"HB-PET-BRU-BYE",categoria:"Pets",costoTotal:1032.45,ingredientes:[{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:1.0,costoUnitario:153.85,costoTotal:153.85},{insumo:"Aceite Esencial de Neroli",proveedor:"",unidad:"mililitros",cantidad:0.5,costoUnitario:158.8,costoTotal:79.4},{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:20.0,costoUnitario:1.57,costoTotal:31.4},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:30.0,costoUnitario:0.65,costoTotal:19.5},{insumo:"Envase Bruma Aurica pet cristal x 60 ml + atomizador",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:644.0,costoTotal:644.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Hidrolato de Manzanilla",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:3.43,costoTotal:34.3}]},
  {id:"brumama_MAU",nombre:"Bruma Manada Unida - Pets",sku:"HB-PET-BRU-MAU",categoria:"Pets",costoTotal:548.31,ingredientes:[{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:0.3,costoUnitario:153.38,costoTotal:46.014},{insumo:"Aceite Esencial de Neroli",proveedor:"",unidad:"mililitros",cantidad:0.3,costoUnitario:158.8,costoTotal:47.64},{insumo:"Agua Destilada",proveedor:"",unidad:"mililitro",cantidad:30.0,costoUnitario:1.57,costoTotal:47.1},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:30.0,costoUnitario:0.65,costoTotal:19.5},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Ro ambar 60 ml + atomizador Negro",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:318.06,costoTotal:318.06}]},
  {id:"bálsamo_BAL",nombre:"Bálsamo Hidratante Pets - Huellitas y Narices",sku:"HB-PET-BOT-BAL",categoria:"Pets",costoTotal:1616.37,ingredientes:[{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:1.5,costoUnitario:153.38,costoTotal:230.07},{insumo:"Cera de Abeja",proveedor:"",unidad:"gramos",cantidad:2.0,costoUnitario:27.0,costoTotal:54.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Lata Pastillero Balsamo",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:350.0,costoTotal:350.0},{insumo:"Manteca de Karite",proveedor:"",unidad:"gramos",cantidad:20.0,costoUnitario:28.7,costoTotal:574.0},{insumo:"Oleato de Caléndula",proveedor:"",unidad:"mililitros",cantidad:20.0,costoUnitario:13.7,costoTotal:274.0},{insumo:"Oleato de Rosa Mosqueta",proveedor:"",unidad:"mililitros",cantidad:5.0,costoUnitario:12.86,costoTotal:64.3}]},
  {id:"cicatriz_CIC",nombre:"Cicatriza Pets - Gel de Aloe",sku:"HB-PET-BOT-CIC",categoria:"Pets",costoTotal:3455.56,ingredientes:[{insumo:"Aceite de Coco",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:14.4,costoTotal:144.0},{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:153.38,costoTotal:306.76},{insumo:"Aceite Esencial de Manzanilla",proveedor:"",unidad:"mililitros",cantidad:0.02,costoUnitario:1200.0,costoTotal:24.0},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Gel aloe",proveedor:"",unidad:"mililitros",cantidad:60.0,costoUnitario:24.06,costoTotal:1443.6},{insumo:"Oleato de Caléndula",proveedor:"",unidad:"mililitros",cantidad:20.0,costoUnitario:13.7,costoTotal:274.0},{insumo:"Oleato de Rosa Mosqueta",proveedor:"",unidad:"mililitros",cantidad:20.0,costoUnitario:12.86,costoTotal:257.2},{insumo:"Pote ambar 30 ml con tapa plateada",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:936.0,costoTotal:936.0}]},
  {id:"fórmula_ADA",nombre:"Fórmula Floral ADAPTACIÓN - Pets",sku:"HB-PET-FL-ADA",categoria:"Pets",costoTotal:1094.62,ingredientes:[{insumo:"Etiquetas",proveedor:"Nirat",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"Frascarg",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:5.0,costoUnitario:5.06,costoTotal:25.3}]},
  {id:"fórmula_AGR",nombre:"Fórmula Floral AGRESIÓN - Pets",sku:"HB-PET-FL-AGR",categoria:"Pets",costoTotal:1094.62,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:5.0,costoUnitario:5.06,costoTotal:25.3}]},
  {id:"fórmula_ANS",nombre:"Fórmula Floral ANSIEDAD - Pets",sku:"HB-PET-FL-ANS",categoria:"Pets",costoTotal:1094.62,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:5.0,costoUnitario:5.06,costoTotal:25.3}]},
  {id:"fórmula_DER",nombre:"Fórmula Floral DERMIS - Pets",sku:"HB-PET-FL-DER",categoria:"Pets",costoTotal:1223.0,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de Bush",proveedor:"",unidad:"dosis",cantidad:2.0,costoUnitario:103.68,costoTotal:207.36},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:4.0,costoUnitario:34.76,costoTotal:139.04},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_DES",nombre:"Fórmula Floral DESAPEGO - Pets",sku:"HB-PET-FL-DES",categoria:"Pets",costoTotal:1094.62,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:5.0,costoUnitario:5.06,costoTotal:25.3}]},
  {id:"fórmula_EST",nombre:"Fórmula Floral ESTRÉS - Pets",sku:"HB-PET-FL-EST",categoria:"Pets",costoTotal:1085.16,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:6.0,costoUnitario:34.76,costoTotal:208.56},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_LAD",nombre:"Fórmula Floral LADRIDOS - Pets",sku:"HB-PET-FL-LAD",categoria:"Pets",costoTotal:1363.24,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:14.0,costoUnitario:34.76,costoTotal:486.64},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"fórmula_MIE",nombre:"Fórmula Floral MIEDOS - Pets",sku:"HB-PET-FL-MIE",categoria:"Pets",costoTotal:1074.38,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:7.0,costoUnitario:34.76,costoTotal:243.32},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:1.0,costoUnitario:5.06,costoTotal:5.06}]},
  {id:"fórmula_SEN",nombre:"Fórmula Floral SENIOR - Pets",sku:"HB-PET-FL-SEN",categoria:"Pets",costoTotal:1363.24,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:14.0,costoUnitario:34.76,costoTotal:486.64},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
  {id:"petcalm_CAL",nombre:"Pet Calm - Sinergia de AE",sku:"HB-PET-BOT-CAL",categoria:"Pets",costoTotal:2426.62,ingredientes:[{insumo:"Aceite Esencial de Bergamota",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:141.4,costoTotal:282.8},{insumo:"Aceite Esencial de Jazmin",proveedor:"",unidad:"mililitros",cantidad:3.0,costoUnitario:140.0,costoTotal:420.0},{insumo:"Aceite Esencial de Lavanda",proveedor:"",unidad:"mililitros",cantidad:4.0,costoUnitario:153.38,costoTotal:613.52},{insumo:"Aceite Esencial de Neroli",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:158.8,costoTotal:317.6},{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Frasco Euro 10 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:722.7,costoTotal:722.7}]},
  {id:"repelent_REP",nombre:"Repelente Natural Pets & Humanos",sku:"HB-PET-BOT-REP",categoria:"Pets",costoTotal:1380.96,ingredientes:[{insumo:"Aceite Esencial de Citronella",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:125.4,costoTotal:250.8},{insumo:"Aceite Esencial de Eucaliptos",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:114.9,costoTotal:229.8},{insumo:"Aceite Esencial de Romero",proveedor:"",unidad:"mililitros",cantidad:2.0,costoUnitario:125.0,costoTotal:250.0},{insumo:"Alcohol de Cereal",proveedor:"",unidad:"mililitro",cantidad:250.0,costoUnitario:0.65,costoTotal:162.5},{insumo:"Envase Omega x 250ml AMBAR con atomizador negro",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:487.86,costoTotal:487.86}]},
  {id:"rescuer_-RR",nombre:"Rescue Remedy - Remedio de Rescate Bach Pets",sku:"HB-HUM-FL-RR",categoria:"Pets",costoTotal:1015.64,ingredientes:[{insumo:"Etiquetas",proveedor:"",unidad:"unidad",cantidad:1.0,costoUnitario:70.0,costoTotal:70.0},{insumo:"Flor de California / Bach / Orquidea",proveedor:"",unidad:"2 gotas",cantidad:4.0,costoUnitario:34.76,costoTotal:139.04},{insumo:"Frasco Euro 30 ml verde con precinto",proveedor:"",unidad:"Unidad",cantidad:1.0,costoUnitario:756.0,costoTotal:756.0},{insumo:"Glicerina vegetal",proveedor:"",unidad:"mililitros",cantidad:10.0,costoUnitario:5.06,costoTotal:50.6}]},
];

const MATERIAS_REALES = [
  {nombre:"Aceite de Almendras",proveedor:"Química Eiffel",unidad:"litro",precio:11030.40,fechaCosto:"2025-11-28"},
  {nombre:"Aceite de Coco",proveedor:"Química Eiffel",unidad:"ml",precio:14.40,fechaCosto:"2025-11-28"},
  {nombre:"Aceite de Ricino",proveedor:"Química Eiffel",unidad:"ml",precio:14.70,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Bergamota",proveedor:"Química Eiffel",unidad:"ml",precio:141.40,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Canela",proveedor:"Química Eiffel",unidad:"ml",precio:220.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Cipré",proveedor:"Química Eiffel",unidad:"ml",precio:108.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Citronella",proveedor:"Química Eiffel",unidad:"ml",precio:125.40,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Clavo de Olor",proveedor:"Química Eiffel",unidad:"ml",precio:270.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Eucaliptos",proveedor:"Química Eiffel",unidad:"ml",precio:114.90,fechaCosto:"2026-03-06"},
  {nombre:"Aceite Esencial de Jazmín",proveedor:"Química Eiffel",unidad:"ml",precio:140.00,fechaCosto:"2026-03-05"},
  {nombre:"Aceite Esencial de Lavanda",proveedor:"Química Eiffel",unidad:"ml",precio:153.38,fechaCosto:"2026-03-05"},
  {nombre:"Aceite Esencial de Limón",proveedor:"Química Eiffel",unidad:"ml",precio:150.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Manzanilla",proveedor:"Química Eiffel",unidad:"ml",precio:1200.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Menta",proveedor:"Química Eiffel",unidad:"ml",precio:225.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Naranja",proveedor:"Química Eiffel",unidad:"ml",precio:100.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Neroli",proveedor:"Química Eiffel",unidad:"ml",precio:158.80,fechaCosto:"2026-03-05"},
  {nombre:"Aceite Esencial de Romero",proveedor:"Química Eiffel",unidad:"ml",precio:125.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Rosas",proveedor:"Química Eiffel",unidad:"ml",precio:171.00,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial de Tea Tree",proveedor:"Química Eiffel",unidad:"ml",precio:206.08,fechaCosto:"2025-11-28"},
  {nombre:"Aceite Esencial Ylang Ylang",proveedor:"",unidad:"ml",precio:208.00,fechaCosto:"2025-11-14"},
  {nombre:"Aceite Rosa Mosqueta",proveedor:"Química Eiffel",unidad:"ml",precio:14.24,fechaCosto:"2025-11-29"},
  {nombre:"Agua de Rosas",proveedor:"Química Eiffel",unidad:"ml",precio:6.74,fechaCosto:"2025-11-28"},
  {nombre:"Agua Destilada",proveedor:"",unidad:"ml",precio:1.57,fechaCosto:"2025-11-03"},
  {nombre:"Alcohol de Cereal",proveedor:"Adecolab",unidad:"ml",precio:0.65,fechaCosto:"2025-11-28"},
  {nombre:"Atomizador enfundado plata/oro Bruma",proveedor:"Megaenvases",unidad:"unid",precio:750.00,fechaCosto:"2025-02-11"},
  {nombre:"Balón de 100 ml pirex",proveedor:"Pasteur",unidad:"unid",precio:8421.60,fechaCosto:"2026-03-04"},
  {nombre:"Bolsa chicha 15x20",proveedor:"Chicha Serigrafía",unidad:"unid",precio:1045.00,fechaCosto:"2026-03-04"},
  {nombre:"Brillo Labial - Roll On",proveedor:"Byf Deco",unidad:"unid",precio:513.00,fechaCosto:"2026-03-05"},
  {nombre:"Cadenita acero dorada para collar",proveedor:"Prosperidad cristales",unidad:"unid",precio:2450.00,fechaCosto:"2024-08-15"},
  {nombre:"Cadenita acero plateado para collar",proveedor:"Prosperidad cristales",unidad:"unid",precio:1000.00,fechaCosto:"2024-08-15"},
  {nombre:"Cera de Abeja",proveedor:"Química Eiffel",unidad:"g",precio:27.00,fechaCosto:"2025-11-28"},
  {nombre:"Cera de Soja",proveedor:"Iskka Home",unidad:"g",precio:4.99,fechaCosto:"2025-02-11"},
  {nombre:"Cristales de Mentol",proveedor:"Química Eiffel",unidad:"g",precio:78.00,fechaCosto:"2025-11-29"},
  {nombre:"Dije Bipolar collar",proveedor:"Prosperidad cristales",unidad:"unid",precio:1602.00,fechaCosto:"2024-08-15"},
  {nombre:"Dije cristal bruto plateado",proveedor:"Prosperidad cristales",unidad:"unid",precio:1634.00,fechaCosto:"2024-08-15"},
  {nombre:"Dije cristal Dorado",proveedor:"Prosperidad cristales",unidad:"unid",precio:1458.00,fechaCosto:"2024-08-15"},
  {nombre:"Dije Turmalina grande",proveedor:"Prosperidad cristales",unidad:"unid",precio:1782.00,fechaCosto:"2024-08-15"},
  {nombre:"Endurecedor",proveedor:"Iskka Home",unidad:"g",precio:9.80,fechaCosto:"2025-02-11"},
  {nombre:"Envase Aluminio Roma x 150 ml",proveedor:"Megaenvases",unidad:"unid",precio:1289.00,fechaCosto:"2025-02-11"},
  {nombre:"Envase Bruma Aurica pet cristal x 60 ml + atomizador",proveedor:"Microbottles",unidad:"unid",precio:644.00,fechaCosto:"2026-03-04"},
  {nombre:"Envase Omega x 250ml AMBAR con atomizador negro",proveedor:"Microbottles",unidad:"unid",precio:487.86,fechaCosto:"2026-03-04"},
  {nombre:"Envase Pet Omega Cristal x 250 ml + tapa difusora",proveedor:"Microbottles",unidad:"unid",precio:740.00,fechaCosto:"2025-11-28"},
  {nombre:"Envase Pet Spray Home Heaven 200 ml",proveedor:"Vs Envases",unidad:"unid",precio:850.00,fechaCosto:"2026-03-05"},
  {nombre:"Envase Pet Teo 120 ml capuchon plateado Brumas KIDS",proveedor:"Vs Envases",unidad:"unid",precio:780.00,fechaCosto:"2026-03-05"},
  {nombre:"Envase Tubo x 20 ml ambar + spray R/18",proveedor:"Frascarg",unidad:"unid",precio:662.40,fechaCosto:"2025-11-28"},
  {nombre:"Erlenmeyer 250 ml",proveedor:"Pasteur",unidad:"unid",precio:3625.00,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Aphrodita Spray Home",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:31.87,fechaCosto:"2025-11-28"},
  {nombre:"Esencia Difusor - Hibiscus",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:51.86,fechaCosto:"2025-11-28"},
  {nombre:"Esencia Java - Spray Home",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:44.54,fechaCosto:"2025-11-28"},
  {nombre:"Esencia Pura de Bergamota",proveedor:"Arofragancias",unidad:"ml",precio:80.69,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Café",proveedor:"Arofragancias",unidad:"ml",precio:62.50,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Canela",proveedor:"Arofragancias",unidad:"ml",precio:65.68,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Eucaliptus",proveedor:"Arofragancias",unidad:"ml",precio:79.56,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Jengibre",proveedor:"Arofragancias",unidad:"ml",precio:80.68,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Lavanda",proveedor:"Arofragancias",unidad:"ml",precio:65.68,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Nardo",proveedor:"Arofragancias",unidad:"ml",precio:65.68,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Neroli",proveedor:"Arofragancias",unidad:"ml",precio:82.85,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Pomelo",proveedor:"Arofragancias",unidad:"ml",precio:65.68,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Rosa",proveedor:"Arofragancias",unidad:"ml",precio:79.92,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Sándalo",proveedor:"Arofragancias",unidad:"ml",precio:79.92,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Pura de Vainilla",proveedor:"Arofragancias",unidad:"ml",precio:80.68,fechaCosto:"2025-02-11"},
  {nombre:"Esencia Spray Home Canela, Vainilla y Tabaco",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:14.31,fechaCosto:"2025-11-28"},
  {nombre:"Etiquetas",proveedor:"Nirat",unidad:"unid",precio:70.00,fechaCosto:"2026-03-05"},
  {nombre:"Fabricación Vela - Laboratorio de Aromas",proveedor:"Laboratorio de Aromas",unidad:"unid",precio:6900.00,fechaCosto:"2025-11-28"},
  {nombre:"Flor de Bush",proveedor:"Laboratorio Floral",unidad:"dosis",precio:103.68,fechaCosto:"2025-11-28"},
  {nombre:"Flor de California / Bach / Orquídea",proveedor:"Londers",unidad:"2 gotas",precio:34.76,fechaCosto:"2025-11-28"},
  {nombre:"Frasco Euro 10 ml ambar con precinto",proveedor:"Frascarg",unidad:"unid",precio:617.40,fechaCosto:"2025-11-28"},
  {nombre:"Frasco Euro 10 ml cristal tapa dorada gotero blanco",proveedor:"Frascarg",unidad:"unid",precio:814.50,fechaCosto:"2025-11-28"},
  {nombre:"Frasco Euro 10 ml verde con precinto",proveedor:"Frascarg",unidad:"unid",precio:722.70,fechaCosto:"2025-11-28"},
  {nombre:"Frasco Euro 30 ml ambar con precinto",proveedor:"Frascarg",unidad:"unid",precio:594.00,fechaCosto:"2026-03-05"},
  {nombre:"Frasco Euro 30 ml azul con precinto",proveedor:"Frascarg",unidad:"unid",precio:594.00,fechaCosto:"2025-11-28"},
  {nombre:"Frasco Euro 30 ml cristal tapa dorada gotero blanco",proveedor:"Frascarg",unidad:"unid",precio:945.00,fechaCosto:"2025-11-28"},
  {nombre:"Frasco Euro 30 ml verde con precinto",proveedor:"Frascarg",unidad:"unid",precio:756.00,fechaCosto:"2026-03-05"},
  {nombre:"Frasco Euro 50 ml ambar con precinto",proveedor:"Frascarg",unidad:"unid",precio:617.00,fechaCosto:"2025-11-28"},
  {nombre:"Frasco Jupiter Sales",proveedor:"",unidad:"unid",precio:700.00,fechaCosto:"2025-09-02"},
  {nombre:"Frasco Tubo Cristal x 50 ml + enfundado dorado R18",proveedor:"Megaenvases",unidad:"unid",precio:1600.00,fechaCosto:"2025-02-11"},
  {nombre:"Gatillo Mini Trigger rosca 24 negro",proveedor:"Megaenvases",unidad:"unid",precio:880.00,fechaCosto:"2025-02-11"},
  {nombre:"Gel Aloe",proveedor:"Química Eiffel",unidad:"ml",precio:24.06,fechaCosto:"2025-11-29"},
  {nombre:"Glicerina Vegetal",proveedor:"",unidad:"ml",precio:5.06,fechaCosto:"2025-12-23"},
  {nombre:"Hidrolato de Lavanda",proveedor:"Química Eiffel",unidad:"ml",precio:5.10,fechaCosto:"2025-11-28"},
  {nombre:"Hidrolato de Manzanilla",proveedor:"Química Eiffel",unidad:"ml",precio:3.43,fechaCosto:"2026-03-05"},
  {nombre:"Hierbas",proveedor:"",unidad:"unid",precio:500.00,fechaCosto:"2025-09-02"},
  {nombre:"Honorarios Jane",proveedor:"",unidad:"unid",precio:25000.00,fechaCosto:"2025-12-23"},
  {nombre:"Lata Pastillero Bálsamo",proveedor:"",unidad:"unid",precio:350.00,fechaCosto:"2025-01-29"},
  {nombre:"Londres",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:16.82,fechaCosto:"2025-12-23"},
  {nombre:"Malasia",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:50.73,fechaCosto:"2025-12-23"},
  {nombre:"Manteca de Karité",proveedor:"Química Eiffel",unidad:"g",precio:28.70,fechaCosto:"2025-11-28"},
  {nombre:"Ojalillos",proveedor:"Iskka Home",unidad:"unid",precio:34.10,fechaCosto:"2024-07-31"},
  {nombre:"Oleato de Caléndula",proveedor:"Química Eiffel",unidad:"ml",precio:13.70,fechaCosto:"2025-11-28"},
  {nombre:"Oleato de Rosa Mosqueta",proveedor:"Química Eiffel",unidad:"ml",precio:12.86,fechaCosto:"2025-11-28"},
  {nombre:"Pabilo para Vela de Soja Grueso",proveedor:"Iskka Home",unidad:"unid",precio:2.80,fechaCosto:"2025-02-11"},
  {nombre:"Packaging",proveedor:"",unidad:"unid",precio:330.00,fechaCosto:"2026-03-05"},
  {nombre:"Pote ambar 100 ml con tapa plateada",proveedor:"Frascarg",unidad:"unid",precio:1215.00,fechaCosto:"2025-11-28"},
  {nombre:"Pote ambar 30 ml con tapa plateada",proveedor:"Frascarg",unidad:"unid",precio:936.00,fechaCosto:"2026-03-05"},
  {nombre:"Raíz de Valeriana",proveedor:"",unidad:"ml",precio:11.49,fechaCosto:"2025-02-11"},
  {nombre:"Ro ambar 60 ml + atomizador Negro",proveedor:"Microbottles",unidad:"unid",precio:318.06,fechaCosto:"2026-03-05"},
  {nombre:"Rosca difusora spray 18 pata gotero",proveedor:"Frascarg",unidad:"unid",precio:207.00,fechaCosto:"2025-11-28"},
  {nombre:"Ruda, Clavo, Canela",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:36.97,fechaCosto:"2025-11-28"},
  {nombre:"Sahumerio Sagrada Madre Caléndula",proveedor:"Grupo Utopía",unidad:"unid",precio:1012.00,fechaCosto:"2024-07-31"},
  {nombre:"Sahumerio Sagrada Madre Salvia Blanca",proveedor:"Grupo Utopía",unidad:"unid",precio:1012.00,fechaCosto:"2024-07-31"},
  {nombre:"Sahumerio Sagrada Madre Lavanda",proveedor:"Grupo Utopía",unidad:"unid",precio:1012.00,fechaCosto:"2024-07-31"},
  {nombre:"Sahumerio Sagrada Madre Rosas",proveedor:"Grupo Utopía",unidad:"unid",precio:1012.00,fechaCosto:"2024-07-31"},
  {nombre:"Sal Gruesa Himalaya",proveedor:"",unidad:"g",precio:0.30,fechaCosto:"2025-09-02"},
  {nombre:"Stock Bottle Bach",proveedor:"Londers",unidad:"2 gotas",precio:34.76,fechaCosto:"2025-11-28"},
  {nombre:"Stock Bottle Bush",proveedor:"Laboratorio Floral",unidad:"7 gotas",precio:131.00,fechaCosto:"2025-11-28"},
  {nombre:"Stock Bottle California",proveedor:"Londers",unidad:"2 gotas",precio:34.76,fechaCosto:"2025-11-28"},
  {nombre:"Stock Bottle Flores",proveedor:"Londers",unidad:"unid",precio:4937.50,fechaCosto:"2025-11-28"},
  {nombre:"Stock Bottle Saint Germain",proveedor:"Laboratorio Floral",unidad:"2 gotas",precio:40.00,fechaCosto:"2025-11-28"},
  {nombre:"Tabaco Rubio",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:14.81,fechaCosto:"2025-11-28"},
  {nombre:"Tahití",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:170.31,fechaCosto:"2025-12-23"},
  {nombre:"Tarde de Otoño",proveedor:"Laboratorio de Aromas",unidad:"ml",precio:21.00,fechaCosto:"2025-11-28"},
  {nombre:"Totebag Dog Love",proveedor:"Chicha Serigrafía",unidad:"unid",precio:2959.00,fechaCosto:"2025-11-03"},
  {nombre:"Trípode Metal + base cemento",proveedor:"Jorge",unidad:"unid",precio:3800.00,fechaCosto:"2026-02-24"},
  {nombre:"Varillas de Ratan",proveedor:"",unidad:"unid",precio:67.20,fechaCosto:"2025-11-03"},
  {nombre:"Vaso Precipitado x 25 ml",proveedor:"Pasteur",unidad:"unid",precio:2668.00,fechaCosto:"2026-02-23"},
  {nombre:"Vela Blanca",proveedor:"Grupo Utopía",unidad:"unid",precio:224.00,fechaCosto:"2024-07-31"},
  {nombre:"Vela de Noche x 12 unidades",proveedor:"Grupo Utopía",unidad:"unid",precio:694.00,fechaCosto:"2024-07-31"},
  {nombre:"Vela Dorada",proveedor:"Grupo Utopía",unidad:"unid",precio:524.00,fechaCosto:"2024-07-31"},
  {nombre:"Vela Plateada",proveedor:"Grupo Utopía",unidad:"unid",precio:524.00,fechaCosto:"2024-07-31"},
  {nombre:"Vela Rosa",proveedor:"Grupo Utopía",unidad:"unid",precio:224.00,fechaCosto:"2024-07-31"},
  {nombre:"Vela Violeta",proveedor:"Grupo Utopía",unidad:"unid",precio:224.00,fechaCosto:"2024-07-31"},
  {nombre:"Vitamina E",proveedor:"Química Eiffel",unidad:"ml",precio:136.82,fechaCosto:"2025-11-29"},
  {nombre:"Vodka - Smirnoff",proveedor:"",unidad:"ml",precio:13.44,fechaCosto:"2025-11-03"},
].map((m,i)=>({...m,id:`m${i+1}`,stock:0,stockMin:0}));

const DEMO = { materias: MATERIAS_REALES, recetas: [], produccion: [], planes: [], compras: [], catalogo: RECETAS_CATALOGO.map(r=>({...r,ingredientes:r.ingredientes.map(i=>({...i}))})) };

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#F0EAE0",surface:"#FDFAF4",alt:"#EDE7DC",border:"#D4C9B0",
  sidebar:"#243C0D",accent:"#85B01A",primary:"#243C0D",
  text:"#1C1A12",muted:"#6A604E",light:"#9E9282",
  danger:"#A82416",dangerBg:"#FBF0EE",
  warning:"#9A660A",warningBg:"#FBF4E4",
  success:"#2A5A10",successBg:"#EDF6E7",
  info:"#1A5C8A",infoBg:"#E8F4FC",
  terra:"#904018",terraBg:"#F6EDE4",
  white:"#FEFCF7",
};
const iSt = {width:"100%",padding:"8px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:C.white,fontSize:14,color:C.text,outline:"none",fontFamily:"inherit"};

const ESTADO_CFG = {
  por_hacer:  { label:"Por hacer",  color:"gray",    dot:"#9E9282" },
  en_proceso: { label:"En proceso", color:"yellow",  dot:"#C8880A" },
  producido:  { label:"Producido",  color:"green",   dot:"#2A5A10" },
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant="primary", size="md", disabled, full }) {
  return <button style={{display:"inline-flex",alignItems:"center",gap:6,border:variant==="ghost"||variant==="secondary"?`1px solid ${C.border}`:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:7,fontFamily:"inherit",fontWeight:500,opacity:disabled?0.5:1,whiteSpace:"nowrap",...(full?{width:"100%",justifyContent:"center"}:{}),...(size==="sm"?{fontSize:12,padding:"4px 10px"}:{fontSize:14,padding:"8px 16px"}),...(variant==="primary"?{background:C.primary,color:"#fff"}:variant==="danger"?{background:C.danger,color:"#fff"}:variant==="success"?{background:C.success,color:"#fff"}:variant==="info"?{background:C.info,color:"#fff"}:variant==="ghost"?{background:"transparent",color:C.muted}:{background:C.alt,color:C.text})}} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Badge({ text, color="gray" }) {
  const m={green:{bg:C.successBg,color:C.success},yellow:{bg:C.warningBg,color:C.warning},red:{bg:C.dangerBg,color:C.danger},gray:{bg:C.alt,color:C.muted},terra:{bg:C.terraBg,color:C.terra},info:{bg:C.infoBg,color:C.info}};
  const col=m[color]||m.gray;
  return <span style={{...col,fontSize:11,fontFamily:"monospace",fontWeight:600,padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap",display:"inline-block"}}>{text}</span>;
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG.por_hacer;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:20,...(estado==="producido"?{background:C.successBg,color:C.success}:estado==="en_proceso"?{background:C.warningBg,color:C.warning}:{background:C.alt,color:C.muted})}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:cfg.dot,flexShrink:0}}/>
      {cfg.label}
    </span>
  );
}

function Field({ label, children, required }) {
  return <div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:C.muted,marginBottom:5}}>{label}{required&&<span style={{color:C.danger}}> *</span>}</label>{children}</div>;
}
const TI=({label,required,...p})=><Field label={label} required={required}><input style={iSt} {...p}/></Field>;
const NI=({label,required,...p})=><Field label={label} required={required}><input type="number" style={iSt} {...p}/></Field>;
const SI=({label,options,required,...p})=><Field label={label} required={required}><select style={{...iSt,cursor:"pointer"}} {...p}><option value="">— seleccionar —</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>;
const TAI=({label,required,...p})=><Field label={label} required={required}><textarea style={{...iSt,resize:"vertical",minHeight:60}} {...p}/></Field>;

function Modal({ title, children, onClose, width=520 }) {
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}><div style={{background:C.surface,borderRadius:12,width:"100%",maxWidth:width,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.22)"}}><div style={{padding:"18px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><h3 style={{fontSize:17,fontWeight:700,color:C.text,margin:0}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:18,lineHeight:1,padding:4}}>✕</button></div><div style={{padding:"22px"}}>{children}</div></div></div>;
}
function PH({ title, sub, action }) {
  return <div style={{padding:"22px 26px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"flex-end",justifyContent:"space-between",background:C.surface,flexShrink:0}}><div><h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:0,letterSpacing:-0.3}}>{title}</h1>{sub&&<p style={{fontSize:13,color:C.muted,margin:"3px 0 0"}}>{sub}</p>}</div>{action}</div>;
}
function Empty({ icon, text }) {
  return <div style={{textAlign:"center",padding:"36px 20px",color:C.light,fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>{icon}</div>{text}</div>;
}
const TH=({children,style:s={}})=><th style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.muted,borderBottom:`1px solid ${C.border}`,background:C.alt,whiteSpace:"nowrap",...s}}>{children}</th>;
const TD=({children,mono,bold,color,style:s={}})=><td style={{padding:"9px 12px",fontSize:13,fontFamily:mono?"monospace":"inherit",fontWeight:bold?600:400,color:color||C.text,borderBottom:`1px solid ${C.border}`,...s}}>{children}</td>;

// ─── Price Update Modal ───────────────────────────────────────────────────────
function PrecioForm({ materia, onSave, onClose }) {
  const [modo,setModo]=useState("pct");
  const [pct,setPct]=useState("");
  const [pDir,setPDir]=useState(materia.precio);
  const pN=modo==="pct"?(pct!==""?+(materia.precio*(1+Number(pct)/100)).toFixed(4):null):pDir;
  const d=diasDesde(materia.fechaCosto);
  const tSt=a=>({flex:1,padding:"8px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:a?700:400,background:a?C.primary:C.alt,color:a?"#fff":C.muted,borderRadius:a?6:0});
  return(
    <Modal title="Actualizar precio" onClose={onClose} width={460}>
      <div style={{background:C.alt,borderRadius:8,padding:"12px 14px",marginBottom:16}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>{materia.nombre}</div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"monospace"}}>{fmtARS(materia.precio)} <span style={{fontSize:13,color:C.light}}>/ {materia.unidad}</span></div>
        {d!==null&&<div style={{fontSize:12,color:d>60?C.warning:C.light,marginTop:3}}>Actualizado hace {d} días ({fmtF(materia.fechaCosto)}){d>60?" ⚠":""}</div>}
      </div>
      <div style={{display:"flex",gap:4,background:C.alt,borderRadius:8,padding:4,marginBottom:16}}>
        <button style={tSt(modo==="pct")} onClick={()=>setModo("pct")}>% Aumento</button>
        <button style={tSt(modo==="dir")} onClick={()=>setModo("dir")}>Precio directo</button>
      </div>
      {modo==="pct"?(
        <div>
          <Field label="Porcentaje de aumento (%)">
            <div style={{display:"flex",gap:8}}>
              <input type="number" min={0} step={0.1} value={pct} onChange={e=>setPct(e.target.value)} style={{...iSt,flex:1}} placeholder="Ej: 15"/>
              {[10,15,20,30,50].map(v=><button key={v} onClick={()=>setPct(v)} style={{padding:"8px 9px",border:`1px solid ${C.border}`,borderRadius:7,background:pct==v?C.primary:C.alt,color:pct==v?"#fff":C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>+{v}%</button>)}
            </div>
          </Field>
          {pN!==null&&<div style={{background:C.successBg,borderRadius:8,padding:"12px 14px"}}><div style={{fontSize:12,color:C.success,marginBottom:2}}>Precio nuevo</div><div style={{fontSize:22,fontWeight:800,color:C.success,fontFamily:"monospace"}}>{fmtARS(pN)} <span style={{fontSize:13}}>/ {materia.unidad}</span></div><div style={{fontSize:12,color:C.success,marginTop:2}}>+ {fmtARS(pN-materia.precio)}</div></div>}
        </div>
      ):(
        <div>
          <NI label={`Precio nuevo ($ / ${materia.unidad})`} required value={pDir} min={0} step={0.01} onChange={e=>setPDir(Number(e.target.value))}/>
          {pDir!==materia.precio&&<div style={{background:pDir>materia.precio?C.successBg:C.warningBg,borderRadius:8,padding:"10px 14px"}}><span style={{fontSize:12,color:pDir>materia.precio?C.success:C.warning,fontFamily:"monospace",fontWeight:600}}>{pDir>materia.precio?"▲":"▼"} {fmt(Math.abs((pDir-materia.precio)/materia.precio*100),1)}% vs actual</span></div>}
        </div>
      )}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="success" disabled={pN===null||pN<=0} onClick={()=>{const n=pN;if(!n||n<=0)return;onSave({...materia,precio:n,fechaCosto:todayStr()});}}>Guardar nuevo precio</Btn>
      </div>
    </Modal>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ data, stockValue, lowStock, catalogoMap, setSection }) {
  const { start, end } = getWeekRange();
  const planSemana = data.planes.filter(p => {
    if (p.estado === "producido") return false;
    const d = new Date(p.fechaEntrega + "T12:00:00");
    return d <= end;
  }).sort((a,b)=>a.fechaEntrega.localeCompare(b.fechaEntrega));

  const comprasPend = data.compras.filter(c => !c.completado);
  const preciosViejos = data.materias.filter(m => { const d=diasDesde(m.fechaCosto); return d!==null&&d>60; });
  const recentProd = data.produccion.slice(0,4);

  const stats = [
    {label:"Valor del stock",val:fmtARS(stockValue),sub:`${data.materias.length} insumos`,color:C.primary},
    {label:"Por producir",val:data.planes.filter(p=>p.estado!=="producido").length,sub:"items por producir",color:C.info},
    {label:"Stock bajo mínimo",val:lowStock.length,sub:"alertas",color:lowStock.length>0?C.danger:C.success},
    {label:"Precios > 60 días",val:preciosViejos.length,sub:"para revisar",color:preciosViejos.length>0?C.warning:C.success},
  ];

  const Widget = ({title,btn,btnAct,children}) => (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <span style={{fontSize:13,fontWeight:700,color:C.text}}>{title}</span>
        {btn&&<button onClick={btnAct} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.primary,fontFamily:"inherit"}}>{btn}</button>}
      </div>
      <div style={{flex:1,overflow:"auto"}}>{children}</div>
    </div>
  );

  return (
    <div style={{flex:1,overflow:"auto"}}>
      <PH title="Dashboard" sub={new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}/>
      <div style={{padding:"22px 26px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
          {stats.map(s=>(
            <div key={s.label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 18px"}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.muted,marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:26,fontWeight:800,color:s.color,letterSpacing:-0.5}}>{s.val}</div>
              <div style={{fontSize:12,color:C.light,marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          {/* Esta semana */}
          <Widget title="📋 Esta semana" btn="Ver plan →" btnAct={()=>setSection("plan")}>
            {planSemana.length===0?<Empty icon="✓" text="Sin órdenes para esta semana"/>:
              planSemana.map(p=>{
                const d=new Date(p.fechaEntrega+"T12:00:00");
                const vencido=d<new Date()&&p.estado!=="producido";
                return(
                  <div key={p.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:vencido?C.dangerBg:"transparent"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{catalogoMap?.[p.recetaId]?.nombre||"—"}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:vencido?C.danger:C.muted}}>Entrega: {fmtF(p.fechaEntrega)} · {p.cantidad} uds</div>
                    </div>
                    <EstadoBadge estado={p.estado}/>
                  </div>
                );
              })
            }
          </Widget>

          {/* Compras pendientes */}
          <Widget title="🛒 Compras pendientes" btn="Ver lista →" btnAct={()=>setSection("compras")}>
            {comprasPend.length===0?<Empty icon="✓" text="Sin compras pendientes"/>:
              comprasPend.slice(0,6).map(c=>(
                <div key={c.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{c.tipo==="auto"?(c.materiaId):c.nombre}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:1}}>{c.tipo==="auto"?`${fmt(c.cantSugerida,0)} unid`:c.cantidad}</div>
                  </div>
                  <Badge text={c.tipo==="auto"?"stock bajo":"manual"} color={c.tipo==="auto"?"yellow":"gray"}/>
                </div>
              ))
            }
            {comprasPend.length>6&&<div style={{padding:"8px 16px",fontSize:12,color:C.muted,textAlign:"center"}}>+ {comprasPend.length-6} más</div>}
          </Widget>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* Precios viejos */}
          <Widget title="📅 Precios sin actualizar" btn={preciosViejos.length>0?"Ver →":null} btnAct={()=>setSection("materias")}>
            {preciosViejos.length===0?<Empty icon="✓" text="Todos los precios actualizados"/>:
              preciosViejos.slice(0,5).map(m=>{
                const d=diasDesde(m.fechaCosto);
                return(
                  <div key={m.id} style={{padding:"9px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:d>120?C.dangerBg:C.warningBg}}>
                    <div><div style={{fontSize:13,fontWeight:500}}>{m.nombre}</div><div style={{fontSize:11,fontFamily:"monospace",color:C.muted}}>{fmtARS(m.precio)} / {m.unidad}</div></div>
                    <Badge text={`${d}d`} color={d>120?"red":"yellow"}/>
                  </div>
                );
              })
            }
          </Widget>

          {/* Producción reciente */}
          <Widget title="⊙ Producción reciente" btn="Ver todo →" btnAct={()=>setSection("produccion")}>
            {recentProd.length===0?<Empty icon="◎" text="Sin producciones registradas"/>:
              recentProd.map(p=>{
                const r=recetasMap[p.recetaId];
                return(
                  <div key={p.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:13,fontWeight:500}}>{r?.nombre||"—"}</div><div style={{fontSize:11,fontFamily:"monospace",color:C.muted}}>{p.fecha} · {p.operador}</div></div>
                    <Badge text={`${p.cantidad} uds`} color="green"/>
                  </div>
                );
              })
            }
          </Widget>
        </div>
      </div>
    </div>
  );
}

// ─── Materias Primas (con multi-select) ───────────────────────────────────────
function Materias({ data, handlers, setModal }) {
  const [search,setSearch]=useState("");
  const [prov,setProv]=useState("");
  const [sel,setSel]=useState(new Set());
  const [editCell,setEditCell]=useState(null);
  const [editVal,setEditVal]=useState("");
  const startEdit=(m,field)=>{setEditCell({id:m.id,field});setEditVal(String(field==="stock"?m.stock:m.stockMin));};
  const commitEdit=(m)=>{if(!editCell)return;const val=parseFloat(editVal);if(!isNaN(val)&&val>=0)handlers.saveMateria({...m,[editCell.field]:val});setEditCell(null);};
  const onKey=(e,m)=>{if(e.key==="Enter")commitEdit(m);if(e.key==="Escape")setEditCell(null);};

  const proveedores=[...new Set(data.materias.map(m=>m.proveedor).filter(Boolean))].sort();
  const filtered=data.materias.filter(m=>m.nombre.toLowerCase().includes(search.toLowerCase())&&(!prov||m.proveedor===prov));

  const allSelected=filtered.length>0&&filtered.every(m=>sel.has(m.id));
  const toggleAll=()=>{ if(allSelected){const s=new Set(sel);filtered.forEach(m=>s.delete(m.id));setSel(s);}else{const s=new Set(sel);filtered.forEach(m=>s.add(m.id));setSel(s);} };
  const toggleOne=id=>{const s=new Set(sel);s.has(id)?s.delete(id):s.add(id);setSel(s);};

  const bulkDelete=()=>{
    if(!window.confirm(`¿Eliminar ${sel.size} insumo${sel.size>1?"s":""}?`))return;
    handlers.delMaterias([...sel]);
    setSel(new Set());
  };

  const st=m=>{if(m.stockMin>0&&m.stock===0)return{label:"Sin stock",color:"red"};if(m.stockMin>0&&m.stock<=m.stockMin)return{label:"Bajo mínimo",color:"yellow"};if(m.stockMin===0)return{label:"—",color:"gray"};return{label:"OK",color:"green"};};

  return(
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Materias Primas" sub={`${data.materias.length} insumos · ${filtered.length} visibles`} action={<Btn onClick={()=>setModal({type:"materia",data:null})}>+ Agregar</Btn>}/>
      <div style={{padding:"14px 26px 8px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar insumo..." style={{...iSt,width:220,fontSize:13}}/>
        <select value={prov} onChange={e=>setProv(e.target.value)} style={{...iSt,width:190,fontSize:13,cursor:"pointer"}}>
          <option value="">Todos los proveedores</option>
          {proveedores.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        {(search||prov)&&<Btn size="sm" variant="ghost" onClick={()=>{setSearch("");setProv("");}}>✕ Limpiar</Btn>}
        {sel.size>0&&(
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,color:C.muted,fontWeight:500}}>{sel.size} seleccionado{sel.size>1?"s":""}</span>
            <Btn variant="danger" size="sm" onClick={bulkDelete}>🗑 Eliminar seleccionados</Btn>
            <Btn variant="ghost" size="sm" onClick={()=>setSel(new Set())}>Cancelar</Btn>
          </div>
        )}
      </div>
      <div style={{padding:"8px 26px 26px",flex:1,overflow:"auto"}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
            <colgroup><col style={{width:"4%"}}/><col style={{width:"22%"}}/><col style={{width:"7%"}}/><col style={{width:"9%"}}/><col style={{width:"14%"}}/><col style={{width:"9%"}}/><col style={{width:"11%"}}/><col style={{width:"8%"}}/><col style={{width:"16%"}}/></colgroup>
            <thead>
              <tr>
                <TH><input type="checkbox" checked={allSelected} onChange={toggleAll} style={{width:15,height:15,cursor:"pointer",accentColor:C.primary}}/></TH>
                <TH>Insumo / Proveedor</TH><TH>Unidad</TH><TH>Stock</TH>
                <TH>Precio / unid</TH><TH>Stock mín.</TH><TH>Valor total</TH><TH>Estado</TH><TH></TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m,i)=>{
                const s=st(m);
                const d=diasDesde(m.fechaCosto);
                const viejo=d!==null&&d>60;
                const isSelected=sel.has(m.id);
                return(
                  <tr key={m.id} style={{background:isSelected?"#EBF0E6":i%2===0?C.surface:C.bg}}>
                    <TD><input type="checkbox" checked={isSelected} onChange={()=>toggleOne(m.id)} style={{width:15,height:15,cursor:"pointer",accentColor:C.primary}}/></TD>
                    <TD style={{overflow:"hidden"}}>
                      <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.nombre}</div>
                      {m.proveedor&&<div style={{fontSize:11,color:C.light,marginTop:1}}>{m.proveedor}</div>}
                    </TD>
                    <TD mono color={C.muted}>{m.unidad}</TD>
                    <TD>
                      {editCell?.id===m.id&&editCell?.field==="stock"?(
                        <input autoFocus type="number" min={0} step={0.1} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>commitEdit(m)} onKeyDown={e=>onKey(e,m)}
                          style={{width:"100%",padding:"3px 6px",fontSize:13,fontFamily:"monospace",fontWeight:600,border:`2px solid ${C.primary}`,borderRadius:5,background:C.white,color:C.text,outline:"none"}}/>
                      ):(
                        <div onClick={()=>startEdit(m,"stock")} title="Click para editar" style={{display:"flex",alignItems:"center",gap:5,cursor:"text",padding:"2px 0"}}>
                          <span style={{fontSize:13,fontFamily:"monospace",fontWeight:600,color:s.color==="red"?C.danger:s.color==="yellow"?C.warning:C.text}}>{fmt(m.stock,1)}</span>
                          <span style={{fontSize:10,color:C.light,opacity:0.7}}>✎</span>
                        </div>
                      )}
                    </TD>
                    <TD>
                      <div style={{fontSize:13,fontFamily:"monospace",fontWeight:600,color:viejo?C.warning:C.text}}>{fmtARS(m.precio)}</div>
                      {m.fechaCosto&&<div style={{fontSize:10,color:viejo?C.warning:C.light,marginTop:1}}>{fmtF(m.fechaCosto)}{viejo?" ⚠":""}</div>}
                    </TD>
                    <TD>
                      {editCell?.id===m.id&&editCell?.field==="stockMin"?(
                        <input autoFocus type="number" min={0} step={1} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>commitEdit(m)} onKeyDown={e=>onKey(e,m)}
                          style={{width:"100%",padding:"3px 6px",fontSize:13,fontFamily:"monospace",fontWeight:600,border:`2px solid ${C.primary}`,borderRadius:5,background:C.white,color:C.text,outline:"none"}}/>
                      ):(
                        <div onClick={()=>startEdit(m,"stockMin")} title="Click para editar" style={{display:"flex",alignItems:"center",gap:5,cursor:"text",padding:"2px 0"}}>
                          <span style={{fontSize:13,fontFamily:"monospace",color:C.muted}}>{m.stockMin>0?fmt(m.stockMin,0):"—"}</span>
                          <span style={{fontSize:10,color:C.light,opacity:0.7}}>✎</span>
                        </div>
                      )}
                    </TD>
                    <TD mono bold color={C.terra}>{m.stock>0?fmtARS(m.stock*m.precio):"—"}</TD>
                    <TD><Badge text={s.label} color={s.color}/></TD>
                    <TD>
                      <div style={{display:"flex",gap:4}}>
                        <Btn size="sm" variant="success" onClick={()=>setModal({type:"precio",data:m})} title="Actualizar precio">$ ↑</Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>setModal({type:"materia",data:m})}>✎</Btn>
                        <Btn size="sm" variant="danger" onClick={()=>{if(window.confirm(`¿Eliminar "${m.nombre}"?`))handlers.delMaterias([m.id]);}}>✕</Btn>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<Empty icon="◎" text="No se encontraron insumos"/>}
        </div>
      </div>
    </div>
  );
}

// ─── Recetas (Catálogo desde XLS) ─────────────────────────────────────────────
const CAT_COLORS = {Home:{bg:"#E8F4FC",color:"#1A5C8A"},Humans:{bg:"#EDF6E7",color:"#2A5A10"},Kids:{bg:"#FBF4E4",color:"#9A660A"},Pets:{bg:"#F6EDE4",color:"#904018"}};
const CATS_LIST = ["Home","Humans","Kids","Pets"];

function RecetasCatalogo({ data, handlers }) {
  const [catFiltro,setCatFiltro]=useState("Todos");
  const [buscar,setBuscar]=useState("");
  const [open,setOpen]=useState(null);
  const [editCell,setEditCell]=useState(null); // {recetaId,ingIdx,field} for number cells
  const [editVal,setEditVal]=useState("");
  const [editText,setEditText]=useState(null); // {recetaId,ingIdx,field} for text cells
  const [editTextVal,setEditTextVal]=useState("");

  const recetas = data.catalogo || [];

  const filtered = recetas.filter(r=>{
    const matchCat=catFiltro==="Todos"||r.categoria===catFiltro;
    const matchBus=!buscar||r.nombre.toLowerCase().includes(buscar.toLowerCase())||r.sku.toLowerCase().includes(buscar.toLowerCase());
    return matchCat&&matchBus;
  });

  const costoReceta = r => r.ingredientes.reduce((s,i)=>s+(i.cantidad*(i.costoUnitario||0)),0);

  // ── save helpers ──
  const updateReceta = (rId, updater) => {
    handlers.saveCatalogo(recetas.map(r=>r.id===rId?updater(r):r));
  };

  // ── numeric inline edit ──
  const startEdit=(recetaId,ingIdx,field,val)=>{setEditCell({recetaId,ingIdx,field});setEditVal(String(val));setEditText(null);};
  const commitEdit=()=>{
    if(!editCell)return;
    const val=parseFloat(editVal);
    if(!isNaN(val)&&val>=0){
      updateReceta(editCell.recetaId,r=>{
        const ings=r.ingredientes.map((ing,idx)=>{
          if(idx!==editCell.ingIdx)return ing;
          const u={...ing,[editCell.field]:val};
          u.costoTotal=+(u.cantidad*u.costoUnitario).toFixed(4);
          return u;
        });
        return{...r,ingredientes:ings,costoTotal:+ings.reduce((s,i)=>s+i.costoTotal,0).toFixed(2)};
      });
    }
    setEditCell(null);
  };
  const onKeyN=e=>{if(e.key==="Enter")commitEdit();if(e.key==="Escape")setEditCell(null);};

  // ── text inline edit ──
  const startEditText=(recetaId,ingIdx,field,val)=>{setEditText({recetaId,ingIdx,field});setEditTextVal(val||"");setEditCell(null);};
  const commitEditText=()=>{
    if(!editText)return;
    updateReceta(editText.recetaId,r=>{
      const ings=r.ingredientes.map((ing,idx)=>idx===editText.ingIdx?{...ing,[editText.field]:editTextVal}:ing);
      return{...r,ingredientes:ings};
    });
    setEditText(null);
  };
  const onKeyT=e=>{if(e.key==="Enter")commitEditText();if(e.key==="Escape")setEditText(null);};

  // ── category edit ──
  const changeCategoria=(rId,cat)=>updateReceta(rId,r=>({...r,categoria:cat}));

  // ── add / remove ingredient ──
  const addIng=(rId)=>updateReceta(rId,r=>({...r,ingredientes:[...r.ingredientes,{insumo:"",proveedor:"",unidad:"",cantidad:0,costoUnitario:0,costoTotal:0}]}));
  const delIng=(rId,idx)=>updateReceta(rId,r=>{
    const ings=r.ingredientes.filter((_,i)=>i!==idx);
    return{...r,ingredientes:ings,costoTotal:+ings.reduce((s,i)=>s+i.costoTotal,0).toFixed(2)};
  });

  // ── render helpers ──
  const numCell=(rId,idx,field,val)=>{
    const active=editCell?.recetaId===rId&&editCell?.ingIdx===idx&&editCell?.field===field;
    if(active)return <input autoFocus type="number" min={0} step={0.01} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={onKeyN} style={{width:80,padding:"2px 5px",fontSize:12,fontFamily:"monospace",border:`2px solid ${C.primary}`,borderRadius:4,background:C.white,outline:"none"}}/>;
    return <span onClick={()=>startEdit(rId,idx,field,val)} style={{cursor:"text",fontFamily:"monospace",fontSize:12,display:"inline-flex",alignItems:"center",gap:3}}>{fmt(val,val<1?4:2)}<span style={{fontSize:9,color:C.light}}>✎</span></span>;
  };
  const txtCell=(rId,idx,field,val,ph="")=>{
    const active=editText?.recetaId===rId&&editText?.ingIdx===idx&&editText?.field===field;
    if(active)return <input autoFocus value={editTextVal} onChange={e=>setEditTextVal(e.target.value)} onBlur={commitEditText} onKeyDown={onKeyT} placeholder={ph} style={{width:"100%",padding:"2px 5px",fontSize:12,border:`2px solid ${C.primary}`,borderRadius:4,background:C.white,outline:"none",fontFamily:"inherit"}}/>;
    return <span onClick={()=>startEditText(rId,idx,field,val)} style={{cursor:"text",fontSize:12,display:"inline-flex",alignItems:"center",gap:3,color:val?C.text:C.light}}>{val||ph}<span style={{fontSize:9,color:C.light,marginLeft:2}}>✎</span></span>;
  };

  return(
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Recetas & Fichas de Producto" sub={`${recetas.length} productos · ${filtered.length} visibles`}/>
      <div style={{padding:"14px 26px 8px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar por nombre o SKU..." style={{...iSt,width:240,fontSize:13}}/>
        <div style={{display:"flex",gap:4}}>
          {["Todos",...CATS_LIST].map(c=>{
            const cfg=CAT_COLORS[c]||{};
            return <button key={c} onClick={()=>setCatFiltro(c)} style={{padding:"5px 13px",border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:catFiltro===c?700:400,background:catFiltro===c?(cfg.bg||C.primary):C.surface,color:catFiltro===c?(cfg.color||"#fff"):C.muted}}>{c}</button>;
          })}
        </div>
      </div>
      <div style={{padding:"8px 26px 26px",flex:1}}>
        {filtered.length===0?<Empty icon="⊕" text="No se encontraron productos"/>:(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(r=>{
              const isOpen=open===r.id;
              const costo=costoReceta(r);
              const catCfg=CAT_COLORS[r.categoria]||{bg:C.alt,color:C.muted};
              return(
                <div key={r.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
                  {/* Header */}
                  <div style={{padding:"11px 16px",display:"flex",alignItems:"center",gap:12,justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1,cursor:"pointer"}} onClick={()=>setOpen(isOpen?null:r.id)}>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nombre}</div>
                        <div style={{fontSize:11,fontFamily:"monospace",color:C.light,marginTop:1}}>SKU: {r.sku}</div>
                      </div>
                    </div>
                    {/* Category selector */}
                    <select value={r.categoria} onChange={e=>{e.stopPropagation();changeCategoria(r.id,e.target.value);}}
                      onClick={e=>e.stopPropagation()}
                      style={{padding:"3px 8px",fontSize:11,fontFamily:"monospace",fontWeight:700,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",background:catCfg.bg,color:catCfg.color,outline:"none"}}>
                      {CATS_LIST.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,color:C.muted}}>Costo total</div>
                        <div style={{fontSize:15,fontWeight:800,color:C.terra,fontFamily:"monospace"}}>{fmtARS(costo)}</div>
                      </div>
                      <span style={{fontSize:15,color:C.light,cursor:"pointer"}} onClick={()=>setOpen(isOpen?null:r.id)}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>
                  {/* Ingredients table */}
                  {isOpen&&(
                    <div style={{borderTop:`1px solid ${C.border}`}}>
                      <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
                        <colgroup><col style={{width:"22%"}}/><col style={{width:"14%"}}/><col style={{width:"9%"}}/><col style={{width:"10%"}}/><col style={{width:"12%"}}/><col style={{width:"12%"}}/><col style={{width:"6%"}}/></colgroup>
                        <thead>
                          <tr>
                            <TH>Insumo ✎</TH><TH>Proveedor ✎</TH><TH>Unidad ✎</TH>
                            <TH>Cantidad ✎</TH><TH>Costo Unitario ✎</TH><TH>Costo al Producto</TH><TH></TH>
                          </tr>
                        </thead>
                        <tbody>
                          {r.ingredientes.map((ing,idx)=>(
                            <tr key={idx} style={{background:idx%2===0?C.surface:C.bg}}>
                              <TD style={{fontSize:12}}>{txtCell(r.id,idx,"insumo",ing.insumo,"nombre del insumo")}</TD>
                              <TD style={{fontSize:11}}>{txtCell(r.id,idx,"proveedor",ing.proveedor,"proveedor")}</TD>
                              <TD style={{fontSize:12}}>{txtCell(r.id,idx,"unidad",ing.unidad,"unidad")}</TD>
                              <TD>{numCell(r.id,idx,"cantidad",ing.cantidad)}</TD>
                              <TD>{numCell(r.id,idx,"costoUnitario",ing.costoUnitario)}</TD>
                              <TD mono bold color={C.terra} style={{fontSize:12}}>{fmtARS(ing.cantidad*(ing.costoUnitario||0))}</TD>
                              <TD><button onClick={()=>delIng(r.id,idx)} title="Eliminar insumo" style={{width:24,height:24,background:C.dangerBg,color:C.danger,border:"none",borderRadius:4,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></TD>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{background:C.alt}}>
                            <td colSpan={3} style={{padding:"9px 12px"}}>
                              <button onClick={()=>addIng(r.id)} style={{fontSize:12,color:C.primary,background:"none",border:`1px dashed ${C.primary}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Agregar insumo</button>
                            </td>
                            <td colSpan={2} style={{padding:"9px 12px",fontSize:12,fontWeight:700,color:C.muted,textAlign:"right"}}>COSTO TOTAL</td>
                            <td style={{padding:"9px 12px",fontSize:14,fontWeight:800,color:C.terra,fontFamily:"monospace"}}>{fmtARS(costo)}</td>
                            <td/>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



// ─── Plan de Producción ───────────────────────────────────────────────────────
function PlanProduccion({ data, handlers, setModal }) {
  const [filtroEstado,setFiltroEstado]=useState("activos");

  const cMap=Object.fromEntries((data.catalogo||[]).map(r=>[r.id,r]));
  const getNombre=id=>cMap[id]?.nombre||"Producto eliminado";

  const filtered = data.planes.filter(p=>{
    if(filtroEstado==="activos") return p.estado!=="producido";
    if(filtroEstado==="producido") return p.estado==="producido";
    return true;
  }).sort((a,b)=>a.fechaEntrega.localeCompare(b.fechaEntrega));

  const hoy=new Date(); hoy.setHours(0,0,0,0);

  return(
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH
        title="Plan de Producción"
        sub={`${data.planes.filter(p=>p.estado!=="producido").length} órdenes activas`}
        action={
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" onClick={()=>setModal({type:"csvPlan"})}>⬆ Importar CSV</Btn>
            <Btn onClick={()=>setModal({type:"plan",data:null})}>+ Nueva orden</Btn>
          </div>
        }
      />
      <div style={{padding:"14px 26px 8px",display:"flex",gap:8}}>
        {[["activos","Activas"],["producido","Producidas"],["todos","Todas"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFiltroEstado(v)} style={{padding:"6px 14px",border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:13,background:filtroEstado===v?C.primary:C.surface,color:filtroEstado===v?"#fff":C.muted,fontWeight:filtroEstado===v?700:400}}>{l}</button>
        ))}
      </div>
      <div style={{padding:"8px 26px 26px",flex:1}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr><TH>Producto</TH><TH>Cantidad</TH><TH>Fecha de entrega</TH><TH>Producido</TH><TH>Estado</TH><TH>Notas</TH><TH></TH></tr>
            </thead>
            <tbody>
              {filtered.map((p,i)=>{
                const d=new Date(p.fechaEntrega+"T12:00:00");
                const vencido=d<hoy&&p.estado!=="producido";
                return(
                  <tr key={p.id} style={{background:vencido?C.dangerBg:i%2===0?C.surface:C.bg}}>
                    <TD bold>{getNombre(p.recetaId)}</TD>
                    <TD mono color={C.muted}>{p.cantidad} uds</TD>
                    <TD>
                      <div style={{fontSize:13,fontFamily:"monospace",color:vencido?C.danger:C.text,fontWeight:vencido?700:400}}>{fmtF(p.fechaEntrega)}</div>
                      {vencido&&<div style={{fontSize:10,color:C.danger}}>Vencida</div>}
                    </TD>
                    <TD mono color={p.totalProducido>0?C.success:C.light}>{p.totalProducido>0?`${p.totalProducido} uds`:"—"}</TD>
                    <TD><EstadoBadge estado={p.estado}/></TD>
                    <TD color={C.muted} style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.notas||"—"}</TD>
                    <TD>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {p.estado==="por_hacer"&&<Btn size="sm" variant="info" onClick={()=>handlers.updatePlanEstado(p.id,"en_proceso",{})}>▶ En proceso</Btn>}
                        {p.estado==="en_proceso"&&<Btn size="sm" variant="success" onClick={()=>setModal({type:"producido",plan:p})}>✓ Producido</Btn>}
                        {p.estado!=="producido"&&<Btn size="sm" variant="ghost" onClick={()=>setModal({type:"plan",data:p})}>✎</Btn>}
                        <Btn size="sm" variant="danger" onClick={()=>{if(window.confirm("¿Eliminar esta orden?"))handlers.delPlan(p.id);}}>✕</Btn>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<Empty icon="📋" text="No hay órdenes en este estado"/>}
        </div>
        <div style={{marginTop:12,padding:"10px 14px",background:C.alt,borderRadius:8,fontSize:11,color:C.muted}}>
          CSV esperado: columnas <code style={{fontFamily:"monospace",background:C.bg,padding:"1px 4px",borderRadius:3}}>producto,cantidad,fecha_entrega,notas</code> — el campo "producto" debe coincidir con el nombre exacto de la receta.
        </div>
      </div>
    </div>
  );
}

// ─── Calculador ───────────────────────────────────────────────────────────────
function Calculador({ data, setModal }) {
  const catalogo = data.catalogo || [];
  const [rId,setRId]=useState(catalogo[0]?.id||"");
  const [qty,setQty]=useState(50);

  const receta=catalogo.find(r=>r.id===rId);
  // Match catalog ingredient names to materias by nombre (case-insensitive)
  const mByNombre=Object.fromEntries(data.materias.map(m=>[m.nombre.toLowerCase().trim(),m]));

  const calc=receta?receta.ingredientes.map(ing=>{
    const m=mByNombre[ing.insumo?.toLowerCase().trim()];
    const nec=ing.cantidad*qty;
    const disp=m?.stock||0;
    return{nombre:ing.insumo,unidad:ing.unidad,materia:m,necesario:nec,disponible:disp,deficit:disp-nec};
  }):[];

  const ok=calc.length>0&&calc.every(r=>r.deficit>=0);
  const cost=receta?receta.ingredientes.reduce((s,ing)=>s+(ing.cantidad*(ing.costoUnitario||0)*qty),0):0;

  return(
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Calculador de Producción" sub="Verificá materiales antes de producir"/>
      <div style={{padding:"22px 26px"}}>
        <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:22,alignItems:"start"}}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:18}}>
            <Field label="Producto" required>
              <select value={rId} onChange={e=>setRId(e.target.value)} style={{...iSt,cursor:"pointer"}}>
                <option value="">— seleccionar —</option>
                {["Home","Humans","Kids","Pets"].map(cat=>(
                  <optgroup key={cat} label={cat}>
                    {catalogo.filter(r=>r.categoria===cat).map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
            <NI label="Cantidad a producir (unidades)" required value={qty} min={1} onChange={e=>setQty(Number(e.target.value))}/>
            {receta&&<>
              <div style={{padding:"12px",background:ok?C.successBg:C.dangerBg,borderRadius:8,marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:700,color:ok?C.success:C.danger,marginBottom:4}}>{ok?"✓ Stock suficiente":"✗ Stock insuficiente"}</div>
                <div style={{fontSize:12,color:C.muted}}>Costo total: {fmtARS(cost)}</div>
                <div style={{fontSize:12,color:C.muted}}>Por unidad: {fmtARS(cost/qty)}</div>
              </div>
              <Btn full onClick={()=>setModal({type:"produccionCat",recetaId:rId,cantidad:qty})} disabled={!ok}>⊙ Registrar producción</Btn>
            </>}
          </div>
          {receta?(
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:14}}>{receta.nombre} · {qty} unidades</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><TH>Ingrediente</TH><TH>Necesario</TH><TH>En stock</TH><TH>Diferencia</TH><TH>Estado</TH></tr></thead>
                <tbody>{calc.map((row,i)=>{const o=row.deficit>=0;return(
                  <tr key={i} style={{background:o?(i%2===0?C.surface:C.bg):C.dangerBg}}>
                    <TD bold style={{fontSize:13}}>{row.nombre}</TD>
                    <TD mono color={C.muted}>{fmt(row.necesario,2)} {row.unidad}</TD>
                    <TD mono bold color={o?C.success:C.danger}>
                      {row.materia?fmt(row.disponible,2):"—"}
                      {!row.materia&&<span style={{fontSize:10,color:C.warning,marginLeft:4}}>sin materia</span>}
                    </TD>
                    <TD mono bold color={o?C.success:C.danger}>{row.materia?(o?"+":"")+fmt(row.deficit,2):"—"}</TD>
                    <TD><Badge text={!row.materia?"Sin materia":o?"OK":"Falta"} color={!row.materia?"yellow":o?"green":"red"}/></TD>
                  </tr>
                );})}
                </tbody>
              </table>
            </div>
          ):<Empty icon="⊘" text="Seleccioná un producto para calcular"/>}
        </div>
      </div>
    </div>
  );
}

// ─── Control de Producción ────────────────────────────────────────────────────
function Produccion({ data, recetasMap, handlers, setModal }) {
  const [filter,setFilter]=useState("");
  const filtered=data.produccion.filter(p=>{if(!filter)return true;const r=recetasMap[p.recetaId];return r?.nombre.toLowerCase().includes(filter.toLowerCase())||p.operador.toLowerCase().includes(filter.toLowerCase());});
  return(
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Control de Producción" sub={`${data.produccion.length} lotes`} action={<Btn onClick={()=>setModal({type:"produccion",recetaId:data.recetas[0]?.id||"",cantidad:50})}>+ Registrar lote</Btn>}/>
      <div style={{padding:"14px 26px 8px"}}><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar..." style={{...iSt,width:280,fontSize:13}}/></div>
      <div style={{padding:"8px 26px 26px"}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><TH>Fecha</TH><TH>Producto</TH><TH>Cantidad</TH><TH>Operador</TH><TH>Notas</TH><TH></TH></tr></thead>
            <tbody>{filtered.map((p,i)=>{const r=recetasMap[p.recetaId];return(
              <tr key={p.id} style={{background:i%2===0?C.surface:C.bg}}>
                <TD mono color={C.muted}>{p.fecha}</TD>
                <TD bold>{r?.nombre||"Receta eliminada"}</TD>
                <TD><Badge text={`${p.cantidad} uds`} color="green"/></TD>
                <TD color={C.muted}>{p.operador}</TD>
                <TD color={C.muted} style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.notas||"—"}</TD>
                <TD><Btn size="sm" variant="danger" onClick={()=>{if(window.confirm("¿Eliminar? No revierte el stock."))handlers.delProduccion(p.id);}}>✕</Btn></TD>
              </tr>
            );})}
            </tbody>
          </table>
          {filtered.length===0&&<Empty icon="◎" text="No hay lotes registrados todavía"/>}
        </div>
      </div>
    </div>
  );
}

// ─── Compras ──────────────────────────────────────────────────────────────────
function Compras({ data, materiasMap, lowStock, handlers, setModal }) {
  const pend=data.compras.filter(c=>!c.completado),comp=data.compras.filter(c=>c.completado);
  const auto=pend.filter(c=>c.tipo==="auto"),manual=pend.filter(c=>c.tipo==="manual");
  const ri=c=>{const m=c.tipo==="auto"?materiasMap[c.materiaId]:null;return(
    <div key={c.id} style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:C.surface}}>
      <input type="checkbox" checked={c.completado} onChange={()=>handlers.toggleCompra(c.id)} style={{width:16,height:16,cursor:"pointer",accentColor:C.primary}}/>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:500}}>{m?m.nombre:c.nombre}</div>
        <div style={{fontSize:11,fontFamily:"monospace",color:C.muted,marginTop:2}}>{m?`Sugerido: ${fmt(c.cantSugerida,0)} ${m.unidad} · Stock: ${fmt(m.stock,0)} · ${m.proveedor||"—"}`:c.cantidad}{c.nota?` · ${c.nota}`:""}</div>
      </div>
      <Badge text={c.tipo==="auto"?"auto":"manual"} color={c.tipo==="auto"?"yellow":"gray"}/>
      <Btn size="sm" variant="danger" onClick={()=>handlers.delCompra(c.id)}>✕</Btn>
    </div>
  );};
  return(
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Lista de Compras" sub={`${pend.length} ítems pendientes`} action={<div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={handlers.generateCompras}>⟳ Generar desde alertas</Btn><Btn onClick={()=>setModal({type:"compraManual"})}>+ Agregar manual</Btn></div>}/>
      <div style={{padding:"22px 26px"}}>
        {pend.length===0&&<Empty icon="✓" text="Lista vacía. Generá desde las alertas o agregá ítems manualmente."/>}
        {auto.length>0&&<div style={{marginBottom:18}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.warning,marginBottom:8}}>⚠ Stock crítico</div><div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>{auto.map(ri)}</div></div>}
        {manual.length>0&&<div style={{marginBottom:18}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.muted,marginBottom:8}}>Ítems manuales</div><div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>{manual.map(ri)}</div></div>}
        {comp.length>0&&<div style={{opacity:0.6}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.light,marginBottom:8}}>✓ Completadas ({comp.length})</div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>{comp.map(c=>{const m=c.tipo==="auto"?materiasMap[c.materiaId]:null;return(<div key={c.id} style={{padding:"9px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,textDecoration:"line-through"}}><input type="checkbox" checked onChange={()=>handlers.toggleCompra(c.id)} style={{width:16,height:16,cursor:"pointer",accentColor:C.primary}}/><span style={{fontSize:13,color:C.muted,flex:1}}>{m?m.nombre:c.nombre}</span><Btn size="sm" variant="ghost" onClick={()=>handlers.delCompra(c.id)}>✕</Btn></div>);})}</div>
        </div>}
      </div>
    </div>
  );
}

// ─── Forms ────────────────────────────────────────────────────────────────────
function MateriaForm({ item, onSave, onClose }) {
  const [f,setF]=useState(item||{nombre:"",proveedor:"",unidad:"ml",stock:0,precio:0,stockMin:0,fechaCosto:todayStr()});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title={item?"Editar insumo":"Nuevo insumo"} onClose={onClose}>
    <TI label="Nombre" required value={f.nombre} onChange={e=>s("nombre",e.target.value)}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <TI label="Proveedor" value={f.proveedor} onChange={e=>s("proveedor",e.target.value)} placeholder="Ej: Química Eiffel"/>
      <TI label="Unidad" required value={f.unidad} onChange={e=>s("unidad",e.target.value)} placeholder="ml / unid / g..."/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <NI label="Stock actual" value={f.stock} min={0} step={0.01} onChange={e=>s("stock",Number(e.target.value))}/>
      <NI label="Stock mínimo" value={f.stockMin} min={0} step={1} onChange={e=>s("stockMin",Number(e.target.value))}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <NI label="Precio por unidad ($)" value={f.precio} min={0} step={0.01} onChange={e=>s("precio",Number(e.target.value))}/>
      <TI label="Fecha de precio" type="date" value={f.fechaCosto} onChange={e=>s("fechaCosto",e.target.value)}/>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.nombre.trim())return;onSave({...f,id:item?.id||genId()});}} disabled={!f.nombre.trim()}>Guardar</Btn>
    </div>
  </Modal>);
}

function RecetaForm({ item, materias, onSave, onClose }) {
  const [f,setF]=useState(item||{nombre:"",descripcion:"",rendimiento:1,ingredientes:[]});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const addIng=()=>setF(p=>({...p,ingredientes:[...p.ingredientes,{materiaId:"",cantidad:0}]}));
  const sIng=(idx,k,v)=>setF(p=>({...p,ingredientes:p.ingredientes.map((ing,i)=>i===idx?{...ing,[k]:v}:ing)}));
  const dIng=idx=>setF(p=>({...p,ingredientes:p.ingredientes.filter((_,i)=>i!==idx)}));
  return(<Modal title={item?"Editar receta":"Nueva receta"} onClose={onClose} width={620}>
    <TI label="Nombre del producto" required value={f.nombre} onChange={e=>s("nombre",e.target.value)}/>
    <TI label="Descripción" value={f.descripcion} onChange={e=>s("descripcion",e.target.value)}/>
    <NI label="Rendimiento (unidades por batch)" value={f.rendimiento} min={1} onChange={e=>s("rendimiento",Number(e.target.value))}/>
    <div style={{marginTop:4}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <label style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.muted}}>Ingredientes</label>
        <Btn size="sm" variant="ghost" onClick={addIng}>+ Agregar</Btn>
      </div>
      {f.ingredientes.length===0&&<div style={{textAlign:"center",padding:16,color:C.light,fontSize:13,border:`1px dashed ${C.border}`,borderRadius:8}}>Agregá los insumos</div>}
      {f.ingredientes.map((ing,idx)=>(
        <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 130px 34px",gap:8,marginBottom:8,alignItems:"end"}}>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Insumo</label>
            <select value={ing.materiaId} onChange={e=>sIng(idx,"materiaId",e.target.value)} style={{...iSt,fontSize:13}}>
              <option value="">— seleccionar —</option>
              {materias.map(m=><option key={m.id} value={m.id}>{m.nombre} ({m.unidad})</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Cantidad {ing.materiaId?`(${materias.find(m=>m.id===ing.materiaId)?.unidad||""})`:""}</label>
            <input type="number" value={ing.cantidad} min={0} step={0.01} onChange={e=>sIng(idx,"cantidad",Number(e.target.value))} style={{...iSt,fontSize:13}}/>
          </div>
          <button onClick={()=>dIng(idx)} style={{height:38,width:34,background:C.dangerBg,color:C.danger,border:"none",borderRadius:7,cursor:"pointer",fontSize:15}}>✕</button>
        </div>
      ))}
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.nombre.trim())return;onSave({...f,id:item?.id||genId()});}} disabled={!f.nombre.trim()}>Guardar receta</Btn>
    </div>
  </Modal>);
}

function PlanForm({ item, catalogo, onSave, onClose }) {
  const [f,setF]=useState(item||{recetaId:catalogo[0]?.id||"",cantidad:50,fechaEntrega:todayStr(),notas:"",estado:"por_hacer",totalProducido:0});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title={item?"Editar orden":"Nueva orden de producción"} onClose={onClose}>
    <Field label="Producto" required>
      <select value={f.recetaId} onChange={e=>s("recetaId",e.target.value)} style={{...iSt,cursor:"pointer"}}>
        <option value="">— seleccionar —</option>
        {["Home","Humans","Kids","Pets"].map(cat=>(
          <optgroup key={cat} label={cat}>
            {catalogo.filter(r=>r.categoria===cat).map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
          </optgroup>
        ))}
      </select>
    </Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <NI label="Cantidad a producir" required value={f.cantidad} min={1} onChange={e=>s("cantidad",Number(e.target.value))}/>
      <TI label="Fecha de entrega" required type="date" value={f.fechaEntrega} onChange={e=>s("fechaEntrega",e.target.value)}/>
    </div>
    <TAI label="Notas" value={f.notas} onChange={e=>s("notas",e.target.value)} placeholder="Observaciones de la orden..."/>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.recetaId)return;onSave({...f,id:item?.id||genId()});}} disabled={!f.recetaId}>Guardar orden</Btn>
    </div>
  </Modal>);
}

function ProducidoForm({ plan, catalogoMap, onSave, onClose }) {
  const r=catalogoMap[plan.recetaId];
  const [f,setF]=useState({totalProducido:plan.cantidad,operador:"Euge",fecha:todayStr(),notas:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title="Marcar como Producido" onClose={onClose} width={460}>
    <div style={{background:C.alt,borderRadius:8,padding:"12px 14px",marginBottom:16}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Orden de producción</div>
      <div style={{fontSize:16,fontWeight:700}}>{r?.nombre||"—"}</div>
      <div style={{fontSize:12,color:C.muted,marginTop:2}}>Planificado: {plan.cantidad} uds · Entrega: {fmtF(plan.fechaEntrega)}</div>
    </div>
    <NI label="Total producido (unidades reales)" required value={f.totalProducido} min={0} onChange={e=>s("totalProducido",Number(e.target.value))}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <TI label="Operador" required value={f.operador} onChange={e=>s("operador",e.target.value)}/>
      <TI label="Fecha de producción" required type="date" value={f.fecha} onChange={e=>s("fecha",e.target.value)}/>
    </div>
    <TAI label="Notas del lote" value={f.notas} onChange={e=>s("notas",e.target.value)} placeholder="Observaciones del lote finalizado..."/>
    <div style={{padding:"10px 12px",background:C.infoBg,borderRadius:8,marginBottom:14,fontSize:12,color:C.info}}>
      ℹ Al confirmar, se registrará automáticamente en Control de Producción.
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn variant="success" onClick={()=>onSave(f)} disabled={f.totalProducido<=0||!f.operador.trim()}>✓ Confirmar producción</Btn>
    </div>
  </Modal>);
}

function ProduccionForm({ recetaId:dR, cantidad:dQ, recetas, onSave, onClose }) {
  const [f,setF]=useState({recetaId:dR||recetas[0]?.id||"",fecha:todayStr(),cantidad:dQ||1,operador:"Euge",notas:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title="Registrar producción" onClose={onClose}>
    <SI label="Receta" required value={f.recetaId} onChange={e=>s("recetaId",e.target.value)} options={recetas.map(r=>({value:r.id,label:r.nombre}))}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <TI label="Fecha" required type="date" value={f.fecha} onChange={e=>s("fecha",e.target.value)}/>
      <NI label="Cantidad (unidades)" required value={f.cantidad} min={1} onChange={e=>s("cantidad",Number(e.target.value))}/>
    </div>
    <TI label="Operador" required value={f.operador} onChange={e=>s("operador",e.target.value)}/>
    <TAI label="Notas" value={f.notas} onChange={e=>s("notas",e.target.value)} placeholder="Observaciones del lote..."/>
    <div style={{padding:"10px 12px",background:C.warningBg,borderRadius:8,marginBottom:14,fontSize:12,color:C.warning}}>⚠ Al guardar se descontarán las materias del stock según la receta.</div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.recetaId)return;onSave(f);}} disabled={!f.recetaId}>Registrar lote</Btn>
    </div>
  </Modal>);
}

function CSVPlanForm({ catalogo, onSave, onClose }) {
  const [csvText,setCsvText]=useState("");
  const [preview,setPreview]=useState([]);
  const [errors,setErrors]=useState([]);

  const nameMap=Object.fromEntries(catalogo.map(r=>[r.nombre.toLowerCase().trim(),r.id]));

  const parseCSV=text=>{
    const lines=text.trim().split("\n").filter(l=>l.trim());
    if(!lines.length){setPreview([]);setErrors([]);return;}
    // detect if first row is header
    const first=lines[0].toLowerCase();
    const hasHeader=first.includes("producto")||first.includes("cantidad")||first.includes("fecha");
    const dataLines=hasHeader?lines.slice(1):lines;
    const rows=[]; const errs=[];
    dataLines.forEach((line,i)=>{
      const cols=line.split(/[,;|\t]/).map(c=>c.trim().replace(/^["']|["']$/g,""));
      const [prod,cant,fecha,notas=""]=cols;
      const rid=nameMap[prod?.toLowerCase().trim()];
      const qty=parseInt(cant);
      const fechaOk=/^\d{4}-\d{2}-\d{2}$/.test(fecha)||/^\d{2}\/\d{2}\/\d{4}$/.test(fecha);
      if(!rid) errs.push(`Fila ${i+2}: producto "${prod}" no encontrado en el catálogo`);
      if(isNaN(qty)||qty<=0) errs.push(`Fila ${i+2}: cantidad inválida "${cant}"`);
      if(!fechaOk) errs.push(`Fila ${i+2}: fecha inválida "${fecha}" (usar AAAA-MM-DD)`);
      const fechaFmt=fecha?.includes("/")?fecha.split("/").reverse().join("-"):fecha;
      rows.push({ok:!!rid&&!isNaN(qty)&&qty>0&&fechaOk,nombre:prod,rid,qty,fecha:fechaFmt,notas});
    });
    setPreview(rows); setErrors(errs);
  };

  const handleImport=()=>{
    const planes=preview.filter(r=>r.ok).map(r=>({id:genId(),recetaId:r.rid,cantidad:r.qty,fechaEntrega:r.fecha,notas:r.notas||"",estado:"por_hacer",totalProducido:0}));
    onSave(planes);
  };

  const okRows=preview.filter(r=>r.ok).length;

  return(<Modal title="Importar Plan desde CSV" onClose={onClose} width={620}>
    <div style={{marginBottom:12,padding:"10px 12px",background:C.infoBg,borderRadius:8,fontSize:12,color:C.info}}>
      Formato esperado (con o sin encabezado): <code style={{fontFamily:"monospace"}}>producto,cantidad,fecha_entrega,notas</code><br/>
      La fecha debe ser <code style={{fontFamily:"monospace"}}>AAAA-MM-DD</code> o <code style={{fontFamily:"monospace"}}>DD/MM/AAAA</code>. Separadores: coma, punto y coma, pipe o tab.
    </div>
    <Field label="Pegá el contenido del CSV">
      <textarea value={csvText} onChange={e=>{setCsvText(e.target.value);parseCSV(e.target.value);}}
        style={{...iSt,fontFamily:"monospace",fontSize:12,minHeight:120,resize:"vertical"}} placeholder={"producto,cantidad,fecha_entrega,notas\nBruma Aroma Sagrado,30,2026-04-20,Lote primavera\nRescue Remedy - Remedio de Rescate Bach,50,2026-04-25,"}/>
    </Field>
    {errors.length>0&&<div style={{background:C.dangerBg,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
      {errors.map((e,i)=><div key={i} style={{fontSize:12,color:C.danger}}>{e}</div>)}
    </div>}
    {preview.length>0&&(
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>{okRows} de {preview.length} filas válidas</div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",maxHeight:200,overflow:"auto"}}>
          {preview.map((r,i)=>(
            <div key={i} style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"center",background:r.ok?C.surface:C.dangerBg}}>
              <span style={{fontSize:14}}>{r.ok?"✓":"✗"}</span>
              <span style={{flex:1,fontSize:12}}>{r.nombre}</span>
              <span style={{fontSize:12,fontFamily:"monospace",color:C.muted}}>{r.qty} uds · {r.fecha}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn variant="primary" disabled={okRows===0} onClick={handleImport}>Importar {okRows>0?`${okRows} órdenes`:""}</Btn>
    </div>
  </Modal>);
}

function CompraManualForm({ onSave, onClose }) {
  const [f,setF]=useState({nombre:"",cantidad:"",nota:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title="Agregar ítem manual" onClose={onClose} width={400}>
    <TI label="Nombre del ítem" required value={f.nombre} onChange={e=>s("nombre",e.target.value)} placeholder="Ej: Alcohol 96°"/>
    <TI label="Cantidad / descripción" value={f.cantidad} onChange={e=>s("cantidad",e.target.value)} placeholder="Ej: 2 litros"/>
    <TI label="Nota" value={f.nota} onChange={e=>s("nota",e.target.value)} placeholder="Para qué se usa..."/>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.nombre.trim())return;onSave(f);}} disabled={!f.nombre.trim()}>Agregar</Btn>
    </div>
  </Modal>);
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [sec,setSec]=useState("dashboard");
  const [data,setData]=useState(null);
  const [modal,setModal]=useState(null);

  useEffect(()=>{
    (async()=>{
      try{
        const r=await window.storage.get(STORAGE_KEY);
        if(r){
          const d=JSON.parse(r.value);
          if(!d.planes) d.planes=[];
          if(!d.catalogo||d.catalogo.length===0) d.catalogo=RECETAS_CATALOGO.map(r=>({...r,ingredientes:r.ingredientes.map(i=>({...i}))})); // migración
          setData(d);
        } else setData(DEMO);
      } catch{ setData(DEMO); }
    })();
  },[]);

  const save=async nd=>{setData(nd);try{await window.storage.set(STORAGE_KEY,JSON.stringify(nd));}catch{}};

  if(!data) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,color:C.muted,fontSize:16}}>Cargando...</div>;

  const mMap=Object.fromEntries(data.materias.map(m=>[m.id,m]));
  const rMap=Object.fromEntries(data.recetas.map(r=>[r.id,r]));
  const cMap=Object.fromEntries((data.catalogo||[]).map(r=>[r.id,r]));
  const stockValue=data.materias.reduce((s,m)=>s+m.stock*m.precio,0);
  const lowStock=data.materias.filter(m=>m.stockMin>0&&m.stock<=m.stockMin);

  const H = {
    saveMateria: m => save({...data,materias:data.materias.find(x=>x.id===m.id)?data.materias.map(x=>x.id===m.id?m:x):[...data.materias,m]}),
    delMaterias: ids => save({...data,materias:data.materias.filter(m=>!ids.includes(m.id))}),
    saveReceta: r => save({...data,recetas:data.recetas.find(x=>x.id===r.id)?data.recetas.map(x=>x.id===r.id?r:x):[...data.recetas,r]}),
    delReceta: id => save({...data,recetas:data.recetas.filter(r=>r.id!==id)}),
    savePlan: p => save({...data,planes:data.planes.find(x=>x.id===p.id)?data.planes.map(x=>x.id===p.id?p:x):[...data.planes,p]}),
    saveCatalogo: nuevas => save({...data,catalogo:nuevas}),
    addPlanesFromCSV: planes => save({...data,planes:[...data.planes,...planes]}),
    delPlan: id => save({...data,planes:data.planes.filter(p=>p.id!==id)}),
    updatePlanEstado: (id, estado, extra) => {
      const planes=data.planes.map(p=>p.id===id?{...p,estado,...extra}:p);
      // If producido, also add to produccion log
      if(estado==="producido"){
        const plan=data.planes.find(p=>p.id===id);
        const entry={id:genId(),recetaId:plan.recetaId,fecha:extra.fecha||todayStr(),cantidad:extra.totalProducido||plan.cantidad,operador:extra.operador||"—",notas:extra.notas||`Orden de producción completada`};
        save({...data,planes,produccion:[entry,...data.produccion]});
      } else {
        save({...data,planes});
      }
    },
    saveProduccion: p => {
      const rec=rMap[p.recetaId];let mats=[...data.materias];
      if(rec) rec.ingredientes.forEach(ing=>{mats=mats.map(m=>m.id===ing.materiaId?{...m,stock:Math.max(0,m.stock-ing.cantidad*p.cantidad)}:m);});
      save({...data,materias:mats,produccion:[{...p,id:genId()},...data.produccion]});
    },
    delProduccion: id => save({...data,produccion:data.produccion.filter(p=>p.id!==id)}),
    toggleCompra: id => save({...data,compras:data.compras.map(c=>c.id===id?{...c,completado:!c.completado}:c)}),
    delCompra: id => save({...data,compras:data.compras.filter(c=>c.id!==id)}),
    addCompraManual: item => save({...data,compras:[...data.compras,{...item,id:genId(),tipo:"manual",completado:false}]}),
    generateCompras: () => {
      const ex=new Set(data.compras.filter(c=>c.tipo==="auto"&&!c.completado).map(c=>c.materiaId));
      const nuevas=lowStock.filter(m=>!ex.has(m.id)).map(m=>({id:genId(),tipo:"auto",materiaId:m.id,cantSugerida:Math.max(m.stockMin*2-m.stock,m.stockMin),completado:false,nota:""}));
      if(nuevas.length===0){window.alert("No hay nuevos ítems para agregar.");return;}
      save({...data,compras:[...data.compras,...nuevas]});
    },
  };

  const sp={data,materiasMap:mMap,recetasMap:rMap,catalogoMap:cMap,stockValue,lowStock,handlers:H,setModal,setSection:setSec};

  const planActivo=data.planes.filter(p=>p.estado!=="producido").length;
  const NAV=[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"materias",icon:"⊛",label:"Materias Primas",badge:lowStock.length||null},
    {id:"recetas",icon:"⊕",label:"Recetas"},
    {id:"plan",icon:"📋",label:"Plan de Producción",badge:planActivo||null},
    {id:"calculador",icon:"⊘",label:"Calculador"},
    {id:"produccion",icon:"⊙",label:"Control de Producción"},
    {id:"compras",icon:"⊗",label:"Lista de Compras",badge:data.compras.filter(c=>!c.completado).length||null},
  ];

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"system-ui,-apple-system,sans-serif",background:C.bg,overflow:"hidden"}}>
      <aside style={{width:222,background:C.sidebar,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.09)"}}>
          <div style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,0.38)",textTransform:"uppercase",marginBottom:6}}>Herbo Botanica</div>
          <div style={{fontSize:17,color:"#fff",fontWeight:800,lineHeight:1.25,letterSpacing:-0.3}}>Gestión de<br/>Stock & Producción</div>
        </div>
        <nav style={{flex:1,padding:"8px 0",overflow:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setSec(n.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px 9px 18px",background:sec===n.id?"rgba(255,255,255,0.14)":"transparent",border:"none",borderLeft:sec===n.id?`3px solid ${C.accent}`:"3px solid transparent",color:sec===n.id?"#fff":"rgba(255,255,255,0.58)",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:sec===n.id?700:400,textAlign:"left"}}>
              <span style={{fontSize:13,width:16,textAlign:"center",flexShrink:0}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.badge?<span style={{background:"#C83020",color:"#fff",borderRadius:10,fontSize:10,padding:"1px 6px",fontFamily:"monospace",fontWeight:700}}>{n.badge}</span>:null}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 18px",borderTop:"1px solid rgba(255,255,255,0.07)",fontSize:10,color:"rgba(255,255,255,0.22)",fontFamily:"monospace"}}>v3.0 · uso interno</div>
      </aside>

      <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
        {sec==="dashboard"&&<Dashboard {...sp}/>}
        {sec==="materias"&&<Materias {...sp}/>}
        {sec==="recetas"&&<RecetasCatalogo data={data} handlers={H}/>}
        {sec==="plan"&&<PlanProduccion data={data} handlers={H} setModal={setModal}/>}
        {sec==="calculador"&&<Calculador data={data} setModal={setModal}/>}
        {sec==="produccion"&&<Produccion {...sp}/>}
        {sec==="compras"&&<Compras {...sp}/>}
      </main>

      {modal?.type==="materia"&&<MateriaForm item={modal.data} onSave={m=>{H.saveMateria(m);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="precio"&&<PrecioForm materia={modal.data} onSave={m=>{H.saveMateria(m);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="receta"&&<RecetaForm item={modal.data} materias={data.materias} onSave={r=>{H.saveReceta(r);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="plan"&&<PlanForm item={modal.data} catalogo={data.catalogo||[]} onSave={p=>{H.savePlan(p);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="csvPlan"&&<CSVPlanForm catalogo={data.catalogo||[]} onSave={planes=>{H.addPlanesFromCSV(planes);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="producido"&&<ProducidoForm plan={modal.plan} catalogoMap={cMap} onSave={f=>{H.updatePlanEstado(modal.plan.id,"producido",f);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="produccionCat"&&<ProduccionForm recetaId={modal.recetaId} cantidad={modal.cantidad} recetas={data.catalogo||[]} onSave={p=>{H.saveProduccion(p);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="produccion"&&<ProduccionForm recetaId={modal.recetaId} cantidad={modal.cantidad} recetas={data.recetas} onSave={p=>{H.saveProduccion(p);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="compraManual"&&<CompraManualForm onSave={c=>{H.addCompraManual(c);setModal(null);}} onClose={()=>setModal(null)}/>}
    </div>
  );
}