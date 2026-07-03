// @ts-nocheck
// ============================================================
// pk-models-extended.ts — AUTO-GENERADO por scripts/assemble-pk-models.mjs
// desde los modelos PK verificados del workflow. NO editar a mano;
// re-generar con: node scripts/assemble-pk-models.mjs <dir> <este archivo>
// Cada micro(c) devuelve V en L y CL/Q en L/min (contrato de Client.tsx).
// ============================================================
/* eslint-disable */
import type { Cov, MicroParams, DrugModel } from "./Client";

export const EXTENDED_MODELS: DrugModel[] = [
  {
    id: "dex_hannivoort",
    name: "Hannivoort (adultos)",
    note: "α2-agonista · sedación",
    unit: "mcg" as "mcg" | "mg",
    citation: "Hannivoort LN, Eleveld DJ, Proost JH, Reyntjens KMEM, Absalom AR, Vereecke HEM, Struys MMRF. Development of an optimized pharmacokinetic model of dexmedetomidine using target-controlled infusion in healthy volunteers. Anesthesiology. 2015;123(2):357-367.",
    refCp: "0.5–8 ng/mL (rango objetivo estudiado por TCI en voluntarios sanos)",
    peds: false,
    micro: (c: Cov): MicroParams => {
      // Hannivoort 2015 — tricompartimental alometrico, ref 70 kg
        // Volumenes ~ (WT/70)^1 ; Clearances ~ (WT/70)^0.75
        var wt = c.weightKg;
        var wr = wt / 70;
        var sizeV = wr;                 // exponente 1 para volumenes
        var sizeCL = Math.pow(wr, 0.75); // exponente 0.75 para clearances
        var V1 = 1.78 * sizeV;
        var V2 = 30.3 * sizeV;
        var V3 = 52.0 * sizeV;
        var CL = 0.686 * sizeCL;
        var Q2 = 2.98 * sizeCL;
        var Q3 = 0.602 * sizeCL;
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
  {
    id: "dex_dyck",
    name: "Dyck (clasico)",
    note: "α2-agonista · sedación",
    unit: "mcg" as "mcg" | "mg",
    citation: "Dyck JB, Maze M, Haack C, Vuorilehto L, Shafer SL. The pharmacokinetics and hemodynamic effects of intravenous and intramuscular dexmedetomidine hydrochloride in adult human volunteers. Anesthesiology. 1993;78(5):813-820. (Modelo de infusion controlada: Dyck JB, Maze M, Haack C, Azarnoff DL, Vuorilehto L, Shafer SL. Computer-controlled infusion of intravenous dexmedetomidine hydrochloride in adult human volunteers. Anesthesiology. 1993;78(5):821-828.)",
    refCp: "~0.3–1.25 ng/mL (concentraciones diana estudiadas por infusion controlada por computadora)",
    peds: false,
    micro: (c: Cov): MicroParams => {
      // Dyck 1993 — tricompartimental clasico. Volumenes fijos (L).
        // Altura[cm] es covariable sobre el clearance central (L/min).
        var ht = c.heightCm;
        var V1 = 7.99;
        var V2 = 13.8;
        var V3 = 187;
        var CL = 0.00791 * ht - 0.927; // L/min, dependiente de altura
        if (CL < 0.1) CL = 0.1;        // piso de seguridad (evita CL <= 0 con alturas muy bajas)
        var Q2 = 2.26;
        var Q3 = 1.99;
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
  {
    id: "dex_morse",
    name: "Morse universal (pediatrico/adulto)",
    note: "α2-agonista · sedación",
    unit: "mcg" as "mcg" | "mg",
    citation: "Morse JD, Cortinez LI, Anderson BJ. A Universal Pharmacokinetic Model for Dexmedetomidine in Children and Adults. J Clin Med. 2020;9(11):3480.",
    refCp: "0.3–2 ng/mL (rango tipico de sedacion; datos combinados neonatos a adultos)",
    peds: true,
    micro: (c: Cov): MicroParams => {
      // Morse 2020 — modelo universal dexmedetomidina (neonatos a adultos).
        // Tamaño: CL ~ (FFM/56.1)^0.75 * maduracion(PMA) ; V ~ (NFM/70)^1.
        // FFM por Al-Sallami 2015 (dependiente de edad y sexo). Ffat=0.293.
        var wt = c.weightKg;
        var htM = c.heightCm / 100;
        var age = c.ageYears;
        var bmi = wt / (htM * htM);
      
        // --- Al-Sallami FFM (kg), edad en años, bmi en kg/m^2 ---
        var ffm;
        if (c.sex === "female") {
          var ageFactorF = 1.11 + (1 - 1.11) / (1 + Math.pow(age / 7.1, -1.1));
          ffm = ageFactorF * ((9270 * wt) / (8780 + 244 * bmi));
        } else {
          var ageFactorM = 0.88 + (1 - 0.88) / (1 + Math.pow(age / 13.4, -12.7));
          ffm = ageFactorM * ((9270 * wt) / (6680 + 216 * bmi));
        }
      
        // --- Normal Fat Mass para volumenes (Ffat = 0.293) ---
        var Ffat = 0.293;
        var nfm = ffm + Ffat * (wt - ffm);
      
        // --- Descriptores de tamaño ---
        var sizeV = nfm / 70;                       // exponente 1 (volumenes ref 70 kg NFM)
        var sizeCL = Math.pow(ffm / 56.1, 0.75);    // exponente 0.75 (CL ref FFM 56.1 kg)
      
        // --- Maduracion sigmoidea del clearance sobre PMA (semanas) ---
        var PMA = age * 52.14 + 40;                 // edad postmenstrual aprox (postnatal + 40 sem)
        var TM50 = 52.4;
        var Hill = 1;
        var MF = Math.pow(PMA, Hill) / (Math.pow(TM50, Hill) + Math.pow(PMA, Hill));
      
        // --- Parametros base (70 kg / FFM 56.1 kg) ---
        var V1 = 25.2 * sizeV;
        var V2 = 34.4 * sizeV;
        var V3 = 65.4 * sizeV;
        var CL = 0.897 * sizeCL * MF;
        var Q2 = 1.68 * sizeCL;
        var Q3 = 0.62 * sizeCL;
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
  {
    id: "ketamine_kamp",
    name: "Ketamina (Kamp 2020, meta-analitico 3-comp)",
    note: "disociativo",
    unit: "mcg" as "mcg" | "mg",
    citation: "Kamp J, Olofsen E, Henthorn TK, van Velzen M, Niesters M, Dahan A. Ketamine Pharmacokinetics: A Systematic Review of the Literature, Meta-analysis, and Population Analysis. Anesthesiology 2020;133(6):1192-1213. doi:10.1097/ALN.0000000000003577. (Publicado simultaneamente como Kamp J, et al. Br J Anaesth analysis; parametros del modelo meta-analitico de 3 compartimentos, Tabla 2.)",
    refCp: "Cp analgesica plasmatica ~100-200 ng/mL; Cp anestesica/disociativa ~1000-2000 ng/mL (1-2 mcg/mL). Modelo estandarizado a 70 kg.",
    peds: false,
    micro: (c: Cov): MicroParams => {
      // Modelo meta-analitico de 3 compartimentos de Kamp 2020 (Tabla 2).
        // Parametros de referencia a 70 kg (Vd en L/70kg, CL en L/h a 70 kg).
        // NO se retuvieron covariables (edad, sexo, formulacion, enantiomero,
        // estado de salud) como significativas para el modelo meta-analitico 3-comp.
        // Escalado alometrico segun el paper: volumenes exponente 1, aclaramientos
        // exponente 0.75, peso de referencia 70 kg.
        const WT = c.weightKg;
        const wtV = WT / 70;                 // exponente 1 para volumenes
        const wtCL = Math.pow(WT / 70, 0.75); // exponente 0.75 para aclaramientos
      
        // Volumenes (L/70kg) -> escalar y ya estan en LITROS
        const V1 = 25 * wtV;
        const V2 = 56 * wtV;
        const V3 = 157 * wtV;
      
        // Aclaramientos publicados en L/h a 70 kg -> escalar y convertir a L/MIN (/60)
        const CL = (84 * wtCL) / 60;
        const Q2 = (161 * wtCL) / 60;
        const Q3 = (79 * wtCL) / 60;
      
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
  {
    id: "rocuronium_kleijn",
    name: "Rocuronio (Kleijn 2011 PK-PD)",
    note: "BNM no despolarizante",
    unit: "mcg" as "mcg" | "mg",
    citation: "Kleijn HJ, Zollinger DP, van den Heuvel MW, Kerbusch T. Population pharmacokinetic-pharmacodynamic analysis for sugammadex-mediated reversal of rocuronium-induced neuromuscular blockade. Br J Clin Pharmacol 2011;72(3):415-433. doi:10.1111/j.1365-2125.2011.04000.x.",
    refCp: "Modelo bicompartimental. Concentracion plasmatica de rocuronio ~1-2 mcg/mL en bloqueo de intubacion; CE50 ~0.8-1.2 mcg/mL. Referencia: no-asiatico, 43 anos, 70 kg, CLcr 119 mL/min.",
    peds: false,
    micro: (c: Cov): MicroParams => {
      // Modelo PK bicompartimental de rocuronio (Kleijn 2011, Tabla 4).
        // Valores de referencia: no-asiatico, edad 43 anos, peso 70 kg, CLcr 119.
        // Bicompartimental => V3=0, Q3=0.
        // Escalado alometrico: volumenes exponente 1, aclaramientos exponente 0.75.
        // Covariables retenidas: edad (sobre CL y V2), etnia asiatica (sobre Q2),
        // aclaramiento de creatinina (sobre V1). NO hay efecto de sexo.
        // Sin creatinina disponible en las covariables de entrada usamos el valor
        // de referencia CLcr=119 (factor V1CR=1). Etnia se asume no-asiatica (factor 1).
        const WT = c.weightKg;
        const AGE = c.ageYears;
        const wt1 = WT / 70;                  // exponente 1 (volumenes)
        const wtCL = Math.pow(WT / 70, 0.75); // exponente 0.75 (aclaramientos)
      
        // CL = CL_ref * (1 + thetaAge*(AGE-43)) * (WT/70)^0.75 ; CL_ref=0.269 L/min
        const clAge = 1 + (-0.00678) * (AGE - 43.0);
        const CL = 0.269 * clAge * wtCL;
      
        // V1 = V1_ref * exp(thetaCr*(CLcr-119)) * (WT/70)^1 ; V1_ref=4.73 L
        // Sin CLcr => usamos CLcr=119 => factor exp(0)=1
        const v1Cr = Math.exp((-0.00143) * (119 - 119));
        const V1 = 4.73 * v1Cr * wt1;
      
        // V2 = V2_ref * exp(thetaAge*(AGE-43)) * (WT/70)^1 ; V2_ref=6.76 L
        const v2Age = Math.exp((0.00613) * (AGE - 43.0));
        const V2 = 6.76 * v2Age * wt1;
      
        // Q2 = Q2_ref * (1 + thetaAsian*asian) * (WT/70)^0.75 ; Q2_ref=0.279 L/min
        // Etnia no-asiatica => factor 1
        const Q2 = 0.279 * wtCL;
      
        const V3 = 0;
        const Q3 = 0;
      
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
  {
    id: "propofol-eleveld",
    name: "Propofol (Eleveld 2018)",
    note: "hipnótico IV",
    unit: "mcg" as "mcg" | "mg",
    citation: "Eleveld DJ, Colin P, Absalom AR, Struys MMRF. Pharmacokinetic-pharmacodynamic model for propofol for broad application in anaesthesia and sedation. Br J Anaesth. 2018;120(5):942-959. doi:10.1016/j.bja.2018.01.018. FFM: Al-Sallami HS, Goulding A, Grant A, Taylor R, Holford N, Duffull SB. Prediction of Fat-Free Mass in Children. Clin Pharmacokinet. 2015;54(11):1169-1178.",
    refCp: "0.5-8 mcg/mL efecto-sitio (inducción ~2.5-6; mantenimiento ~2-4; sedación 0.5-1.5)",
    peds: true,
    micro: (c: Cov): MicroParams => {
      // ===== Eleveld 2018 propofol — PK (parámetros arteriales). V en L, CL/Q en L/min. =====
      var WGT = c.weightKg;
      var AGE = c.ageYears;
      var HGT = c.heightCm;
      var male = (c.sex === "male");
      
      // ---- Individuo de referencia: 35 a, 170 cm, 70 kg, varón, SIN fármacos concomitantes ----
      var WGTref = 70, AGEref = 35, HGTref = 170;
      var PMA = AGE * 52.143 + 40;          // semanas
      var PMAref = AGEref * 52.143 + 40;    // 1865.005 sem
      
      // ---- Constantes theta (Tabla 2, Eleveld 2018) ----
      var Q1 = 6.28, Q2t = 25.5, Q3t = 273.0;   // V1ref, V2ref, V3ref (L)
      var Q4 = 1.79, Q5 = 1.75, Q6 = 1.11;      // CLref(male), Q2ref(coef), Q3ref (L/min)
      var Q8 = 42.3, Q9 = 9.06;                 // CL maturation E50 (sem), pendiente
      var Q10 = -0.0156;                        // menor V2 con edad
      var Q11 = -0.00286;                       // menor CL con edad (término opioides)
      var Q12 = 33.6;                           // peso para 50% de V1 máx (kg)
      var Q13 = -0.0138;                        // menor V3 con edad (término opioides)
      var Q14 = 68.3;                           // maduración de Q3 (sem)
      var Q15 = 2.10;                           // CLref (female)
      var Q16 = 1.30;                           // mayor Q2 por maduración de Q3
      
      // ---- Coadministración de opioides (default clínico perioperatorio) ----
      var OPIOIDS = true;   // false => propofol solo / sedación sin opioide
      
      // ---- Funciones auxiliares ----
      function faging(x) { return Math.exp(x * (AGE - AGEref)); }
      function fsigmoid(x, E50, lambda) {
        return Math.pow(x, lambda) / (Math.pow(x, lambda) + Math.pow(E50, lambda));
      }
      function fcentral(w) { return fsigmoid(w, Q12, 1); }   // Emax en peso para V1
      
      // FFM Al-Sallami (usa WGT, AGE, BMI, sexo)
      var BMI = WGT / Math.pow(HGT / 100, 2);
      var BMIref = WGTref / Math.pow(HGTref / 100, 2);
      function fAlSallami(sexMale, age, wgt, bmi) {
        if (sexMale) {
          return (0.88 + (1 - 0.88) / (1 + Math.pow(age / 13.4, -12.7))) *
                 ((9270 * wgt) / (6680 + 216 * bmi));
        } else {
          return (1.11 + (1 - 1.11) / (1 + Math.pow(age / 7.1, -1.1))) *
                 ((9270 * wgt) / (8780 + 244 * bmi));
        }
      }
      var FFM = fAlSallami(male, AGE, WGT, BMI);
      var FFMref = fAlSallami(true, AGEref, WGTref, BMIref);   // referencia = varón 35a
      
      // Maduración
      var fCLmat = fsigmoid(PMA, Q8, Q9);
      var fCLmatRef = fsigmoid(PMAref, Q8, Q9);
      var fQ3mat = fsigmoid(PMA, Q14, 1);
      var fQ3matRef = fsigmoid(PMAref, Q14, 1);
      
      // fopiates: presencia => exp(coef*AGE); ausencia => 1. La referencia usa 1 (sin fármacos concomitantes).
      function fopiCL() { return OPIOIDS ? Math.exp(Q11 * AGE) : 1; }
      function fopiV3() { return OPIOIDS ? Math.exp(Q13 * AGE) : 1; }
      
      // ---- Volúmenes (L) ----
      var V1 = Q1 * (fcentral(WGT) / fcentral(WGTref));
      var V2 = Q2t * (WGT / WGTref) * faging(Q10);
      var V3ref = Q3t;                                 // referencia sin opioides: fopiates=1
      var V3 = Q3t * (FFM / FFMref) * fopiV3();
      
      // ---- Clearances (L/min) ----
      var CLref = male ? Q4 : Q15;
      var CL = CLref * Math.pow(WGT / WGTref, 0.75) * (fCLmat / fCLmatRef) * fopiCL();
      
      var V2ref = Q2t;                                 // V2 de referencia = Q2 (faging=1)
      var Q2 = Q5 * Math.pow(V2 / V2ref, 0.75) * (1 + Q16 * (1 - fQ3mat));
      
      var Q3 = Q6 * Math.pow(V3 / V3ref, 0.75) * (fQ3mat / fQ3matRef);
      
      return { V1: V1, V2: V2, V3: V3, CL: CL, Q2: Q2, Q3: Q3 };
    },
  },
  {
    id: "paedfusor",
    name: "Paedfusor (propofol pediátrico)",
    note: "modelo PK",
    unit: "mcg" as "mcg" | "mg",
    citation: "Absalom A, Kenny G. 'Paedfusor' pharmacokinetic data set. Br J Anaesth. 2005;95(1):110. doi:10.1093/bja/aei567. (Validado en: Absalom A, Amutike D, Lal A, White M, Kenny GN. Accuracy of the 'Paedfusor' in children undergoing cardiac surgery or catheterization. Br J Anaesth. 2003;91(4):507-13.)",
    refCp: "Cp diana efecto/plasma habitual 2-6 mcg/mL (inducción/mantenimiento TIVA pediátrica); mismas unidades que Marsh/Schnider adultos.",
    peds: true,
    micro: (c: Cov): MicroParams => {
      // Paedfusor (Absalom & Kenny, BJA 2005;95:110). k en min^-1; V1 en LITROS.
        // k12,k21,k13,k31 fijos para todo el rango; k10 y V1 dependen de la edad.
        const wt = c.weightKg;
        const age = c.ageYears;
      
        const k12 = 0.114;    // min^-1
        const k21 = 0.055;    // min^-1
        const k13 = 0.0419;   // min^-1
        const k31 = 0.0033;   // min^-1
      
        let V1;   // litros
        let k10;  // min^-1
      
        if (age < 13) {
          // 1-12 años: V1 = 0.4584 * wt (L);  k10 = 0.1527 * wt^-0.3
          V1 = 0.4584 * wt;
          k10 = 0.1527 * Math.pow(wt, -0.3);
        } else if (age < 14) {
          // 13 años: V1 = 400.0 mL/kg;  k10 = 0.0678
          V1 = 0.4000 * wt;
          k10 = 0.0678;
        } else if (age < 15) {
          // 14 años: V1 = 342.0 mL/kg;  k10 = 0.0792
          V1 = 0.3420 * wt;
          k10 = 0.0792;
        } else if (age < 16) {
          // 15 años: V1 = 284.0 mL/kg;  k10 = 0.0954
          V1 = 0.2840 * wt;
          k10 = 0.0954;
        } else {
          // 16 años: V1 = 228.57 mL/kg;  k10 = 0.119
          V1 = 0.22857 * wt;
          k10 = 0.119;
        }
      
        // Conversión k-rates -> micro (V en L, CL/Q en L/min)
        const CL = k10 * V1;   // L/min
        const Q2 = k12 * V1;   // L/min
        const Q3 = k13 * V1;   // L/min
        const V2 = Q2 / k21;   // L
        const V3 = Q3 / k31;   // L
      
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
  {
    id: "kataria",
    name: "Kataria (propofol pediátrico)",
    note: "modelo PK",
    unit: "mcg" as "mcg" | "mg",
    citation: "Kataria BK, Ved SA, Nicodemus HF, Hoy GR, Lea D, Dubois MY, Mandema JW, Shafer SL. The pharmacokinetics of propofol in children using three different data analysis approaches. Anesthesiology. 1994;80(1):104-122. doi:10.1097/00000542-199401000-00018.",
    refCp: "Cp diana plasma habitual 2-6 mcg/mL (TIVA/TCI pediátrica, niños 3-16 años, 15-61 kg).",
    peds: true,
    micro: (c: Cov): MicroParams => {
      // Kataria (Anesthesiology 1994;80:104-122). Volúmenes en LITROS, aclaramientos en L/min.
        // Escalado lineal por peso; V2 con término de edad.
        const wt = c.weightKg;
        const age = c.ageYears;
      
        const V1 = 0.41 * wt;                     // L
        let V2 = 0.78 * wt + 3.1 * age - 16;      // L (término de edad del paper)
        const V3 = 6.9 * wt;                      // L
      
        // Salvaguarda numérica: V2 debe ser positivo (edades/pesos muy bajos fuera del rango validado)
        if (V2 <= 0) V2 = 0.1;
      
        const CL = 0.035 * wt;   // L/min (Cl1, 35 mL/kg/min)
        const Q2 = 0.077 * wt;   // L/min (Cl2)
        const Q3 = 0.026 * wt;   // L/min (Cl3)
      
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
  {
    id: "remifentanil-eleveld",
    name: "Remifentanilo (Eleveld 2017)",
    note: "opioide ultracorto",
    unit: "mcg" as "mcg" | "mg",
    citation: "Eleveld DJ, Proost JH, Vereecke H, Absalom AR, Olofsen E, Vuyk J, Struys MMRF. An Allometric Model of Remifentanil Pharmacokinetics and Pharmacodynamics. Anesthesiology. 2017;126(6):1005-1018. (Modelo PK tricompartimental de aplicación amplia; covariables peso, edad, talla, sexo y masa magra [FFM]. Individuo de referencia: 35 años, 70 kg, 170 cm, varón.)",
    refCp: "Cp de referencia analgesia/anestesia balanceada ~1-8 ng/mL (mcg/L). TCI plasma/effect-site típico 2-6 ng/mL. C50 (efecto EEG) 12.7 ng/mL, ke0 1.09/min en el individuo de referencia.",
    peds: false,
    micro: (c: Cov): MicroParams => {
      // ---------------------------------------------------------------------------
        // Remifentanilo — modelo Eleveld (Anesthesiology 2017;126:1005-1018).
        // Modelo tricompartimental. Covariables: peso, edad, talla, sexo y FFM.
        // Individuo de referencia: 35 a / 70 kg / 170 cm / varón.
        // Ecuaciones exactas del paper (validadas contra tci R package,
        // Rathbun/Hughes; jarretrt/tci · R/poppk_mods.R · pkmod_eleveld_remi).
        // Volúmenes en L; aclaramientos en L/min.
        // ---------------------------------------------------------------------------
      
        var AGE  = c.ageYears;
        var TBW  = c.weightKg;
        var HGT  = c.heightCm;
        var MALE = (c.sex === "male");
      
        // Índice de masa corporal (kg/m^2) a partir de talla en cm.
        var BMI = 10000.0 * TBW / HGT / HGT;
      
        // --- Individuo de referencia ---
        var AGEref = 35.0;
        var TBWref = 70.0;
        var HGTref = 170.0;
        var BMIref = 10000.0 * TBWref / HGTref / HGTref;
      
        // --- Masa magra (FFM) — Al-Sallami 2015 (usada por Eleveld) ---
        var FFM;
        if (MALE) {
          FFM = (0.88 + (1.0 - 0.88) / (1.0 + Math.pow(AGE / 13.4, -12.7)))
              * (9270.0 * TBW) / (6680.0 + 216.0 * BMI);
        } else {
          FFM = (1.11 + (1.0 - 1.11) / (1.0 + Math.pow(AGE / 7.1, -1.1)))
              * (9270.0 * TBW) / (8780.0 + 244.0 * BMI);
        }
        var FFMref = (0.88 + (1.0 - 0.88) / (1.0 + Math.pow(AGEref / 13.4, -12.7)))
                   * (9270.0 * TBWref) / (6680.0 + 216.0 * BMIref);
      
        // --- Funciones auxiliares del modelo ---
        // Envejecimiento exponencial: faging(x) = exp(x*(AGE-AGEref))
        var faging = function (x) { return Math.exp(x * (AGE - AGEref)); };
        // Sigmoide de maduración: x^lambda / (x^lambda + E50^lambda)
        var fsigmoid = function (x, E50, lambda) {
          var xl = Math.pow(x, lambda);
          return xl / (xl + Math.pow(E50, lambda));
        };
      
        // --- Thetas de efectos fijos (Eleveld 2017, remifentanilo PK) ---
        // theta1..theta6
        var th1 = 2.88;      // KMAT E50 (peso, maduración de CL)
        var th2 = -0.00554;  // envejecimiento sobre V1 / Q2 / Q3
        var th3 = -0.00327;  // envejecimiento sobre V2 y CL
        var th4 = -0.0315;   // envejecimiento sobre V3
        var th5 = 0.470;     // efecto sexo (mujeres)
        var th6 = -0.0260;   // efecto peso sobre V3
      
        // --- Parámetros de referencia (individuo tipo) ---
        var V1ref = 5.81;   // L
        var V2ref = 8.82;   // L
        var V3ref = 5.03;   // L
        var CLref = 2.58;   // L/min
        var Q2ref = 1.72;   // L/min
        var Q3ref = 0.124;  // L/min
      
        // --- Escalado alométrico y covariables ---
        var SIZE = FFM / FFMref;                       // alometría sobre FFM
        var KMAT    = fsigmoid(TBW, th1, 2);           // maduración de CL por peso
        var KMATref = fsigmoid(TBWref, th1, 2);
        // Efecto sexo (KSEX): 1 en varones; en mujeres función de la edad.
        var KSEX = MALE
          ? 1.0
          : 1.0 + th5 * fsigmoid(AGE, 12, 6) * (1.0 - fsigmoid(AGE, 45, 6));
      
        // --- Parámetros individuales (ecuaciones exactas del paper) ---
        var V1 = V1ref * SIZE * faging(th2);
        var V2 = V2ref * SIZE * faging(th3) * KSEX;
        // NOTA: V3 escala desde V3ref (5.03 L). El paquete tci tiene una errata
        // (usa V2ref) que rompe la reproducción del individuo de referencia;
        // aquí se corrige para que V3(ref)=5.03 y Q3(ref)=0.124 exactos.
        var V3 = V3ref * SIZE * faging(th4) * Math.exp(th6 * (TBW - 70.0));
        var CL = CLref * Math.pow(SIZE, 0.75) * (KMAT / KMATref) * KSEX * faging(th3);
        var Q2 = Q2ref * Math.pow(V2 / V2ref, 0.75) * faging(th2) * KSEX;
        var Q3 = Q3ref * Math.pow(V3 / V3ref, 0.75) * faging(th2);
      
        return { V1, V2, V3, CL, Q2, Q3 };
    },
  },
];
