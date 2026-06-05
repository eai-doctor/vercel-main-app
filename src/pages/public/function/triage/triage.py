"""
CTAS triage helpers for the public triage feature.

This module keeps the logic aligned with the CTAS training material:
- quick critical look
- chief complaint
- subjective/objective assessment
- modifiers
- CTAS level 1 to 5
- reassessment guidance
"""

from __future__ import annotations

from typing import Any, Dict, List


CTAS_LEVELS = {
    1: {
        "name": "Level 1 - Resuscitation",
        "priority": "Immediate",
        "destination": "Resuscitation bay",
        "reassessment": "Continuous nursing care",
        "summary": "Needs immediate resuscitation and uninterrupted attention.",
    },
    2: {
        "name": "Level 2 - Emergent",
        "priority": "Within 15 minutes",
        "destination": "High-acuity treatment area",
        "reassessment": "Every 15 minutes",
        "summary": "High risk of rapid deterioration or significant physiologic instability.",
    },
    3: {
        "name": "Level 3 - Urgent",
        "priority": "Within 30 minutes",
        "destination": "Treatment area",
        "reassessment": "Every 30 minutes",
        "summary": "Needs timely care, but is not in immediate danger.",
    },
    4: {
        "name": "Level 4 - Less Urgent",
        "priority": "Within 60 minutes",
        "destination": "Waiting or lower-acuity area",
        "reassessment": "Every 60 minutes",
        "summary": "Stable enough to wait, with monitoring for changes.",
    },
    5: {
        "name": "Level 5 - Non-Urgent",
        "priority": "Within 120 minutes",
        "destination": "Low-acuity area",
        "reassessment": "Every 120 minutes",
        "summary": "Suitable for the lowest acuity stream.",
    },
}

CTAS_LEVELS_I18N = {
    "en": CTAS_LEVELS,
    "fr": {
        1: {**CTAS_LEVELS[1], "name": "Niveau 1 - Réanimation"},
        2: {**CTAS_LEVELS[2], "name": "Niveau 2 - Urgent"},
        3: {**CTAS_LEVELS[3], "name": "Niveau 3 - Urgent"},
        4: {**CTAS_LEVELS[4], "name": "Niveau 4 - Moins urgent"},
        5: {**CTAS_LEVELS[5], "name": "Niveau 5 - Non urgent"},
    },
    "zh": {
        1: {**CTAS_LEVELS[1], "name": "1级 - 复苏"},
        2: {**CTAS_LEVELS[2], "name": "2级 - 紧急"},
        3: {**CTAS_LEVELS[3], "name": "3级 - 需尽快处理"},
        4: {**CTAS_LEVELS[4], "name": "4级 - 较不紧急"},
        5: {**CTAS_LEVELS[5], "name": "5级 - 非紧急"},
    },
}


CTAS_MAP: Dict[str, Dict[str, Any]] = {
    "airway_issue": {"level": 1, "label": "Cannot breathe / airway blocked"},
    "no_pulse": {"level": 1, "label": "No pulse / cardiac arrest"},
    "unresponsive": {"level": 1, "label": "Unresponsive"},
    "seizure_now": {"level": 1, "label": "Active seizure"},
    "blue_lips": {"level": 1, "label": "Blue lips / face"},
    "severe_bleeding": {"level": 1, "label": "Uncontrolled heavy bleeding"},
    "stroke_signs": {"level": 2, "label": "Stroke-like signs"},
    "chest_pain": {"level": 2, "label": "Chest pain / pressure"},
    "short_breath": {"level": 2, "label": "Severe trouble breathing"},
    "confused": {"level": 2, "label": "Very confused / not making sense"},
    "allergic_reaction": {"level": 2, "label": "Severe allergic reaction"},
    "overdose": {"level": 2, "label": "Poisoning / overdose"},
    "severe_headache": {"level": 2, "label": "Sudden severe headache"},
    "one_sided_weakness": {"level": 2, "label": "New weakness on one side"},
    "vomiting_blood": {"level": 2, "label": "Vomiting blood"},
    "major_trauma": {"level": 2, "label": "Major injury / bad crash"},
    "threatened_limb": {"level": 2, "label": "Arm or leg looks threatened"},
    "pregnancy_complication": {"level": 2, "label": "Pregnancy concern with pain or bleeding"},
    "fever_stiff_neck": {"level": 2, "label": "Fever with stiff neck"},
    "moderate_breathing": {"level": 3, "label": "Breathing is harder than usual"},
    "moderate_belly_pain": {"level": 3, "label": "Belly pain that is getting worse"},
    "injury_needs_stitches": {"level": 3, "label": "Cut or wound may need stitches"},
    "fever_chills": {"level": 3, "label": "Fever with chills"},
    "can_not_walk": {"level": 3, "label": "Cannot walk or stand well"},
    "rash_spreading": {"level": 3, "label": "New rash is spreading"},
    "painful_swollen_joint": {"level": 3, "label": "Very painful swollen joint"},
    "urine_pain_blood": {"level": 3, "label": "Pain or blood when peeing"},
    "eye_injury": {"level": 3, "label": "Eye injury / sudden vision change"},
    "sexual_assault": {"level": 3, "label": "Sexual assault"},
    "animal_bite": {"level": 3, "label": "Animal bite / exposure"},
    "ear_severe_pain": {"level": 3, "label": "Severe ear pain"},
    "child_not_drinking": {"level": 3, "label": "Child not drinking or eating"},
    "mild_pain": {"level": 4, "label": "Mild pain"},
    "sore_throat_cold": {"level": 4, "label": "Sore throat / cold symptoms"},
    "itchy_rash": {"level": 4, "label": "Mild rash or itching"},
    "small_cut": {"level": 4, "label": "Small cut or bruise"},
    "nausea_no_vomit": {"level": 4, "label": "Nausea without vomiting"},
    "mild_fever": {"level": 4, "label": "Mild fever"},
    "back_pain_mild": {"level": 4, "label": "Mild back pain"},
    "dizzy_mild": {"level": 4, "label": "Mild dizziness"},
    "chronic_check": {"level": 5, "label": "Chronic condition check"},
    "refill": {"level": 5, "label": "Prescription refill"},
}

CTAS_LABELS = {
    "en": {
        "airway_issue": "Can't breathe / airway blocked",
        "no_pulse": "No pulse / cardiac arrest",
        "unresponsive": "Unresponsive",
        "seizure_now": "Active seizure",
        "blue_lips": "Blue lips / face",
        "severe_bleeding": "Uncontrolled heavy bleeding",
        "stroke_signs": "Stroke-like signs",
        "chest_pain": "Chest pain / pressure",
        "short_breath": "Severe trouble breathing",
        "confused": "Very confused / not making sense",
        "allergic_reaction": "Severe allergic reaction",
        "overdose": "Poisoning / overdose",
        "severe_headache": "Sudden severe headache",
        "one_sided_weakness": "New weakness on one side",
        "vomiting_blood": "Vomiting blood",
        "major_trauma": "Major injury / bad crash",
        "threatened_limb": "Arm or leg looks threatened",
        "pregnancy_complication": "Pregnancy concern with pain or bleeding",
        "fever_stiff_neck": "Fever with stiff neck",
        "moderate_breathing": "Breathing is harder than usual",
        "moderate_belly_pain": "Belly pain that is getting worse",
        "injury_needs_stitches": "Cut or wound may need stitches",
        "fever_chills": "Fever with chills",
        "can_not_walk": "Cannot walk or stand well",
        "rash_spreading": "New rash is spreading",
        "painful_swollen_joint": "Very painful swollen joint",
        "urine_pain_blood": "Pain or blood when peeing",
        "eye_injury": "Eye injury / sudden vision change",
        "sexual_assault": "Sexual assault",
        "animal_bite": "Animal bite / exposure",
        "ear_severe_pain": "Severe ear pain",
        "child_not_drinking": "Child not drinking or eating",
        "mild_pain": "Mild pain",
        "sore_throat_cold": "Sore throat / cold symptoms",
        "itchy_rash": "Mild rash or itching",
        "small_cut": "Small cut or bruise",
        "nausea_no_vomit": "Nausea without vomiting",
        "mild_fever": "Mild fever",
        "back_pain_mild": "Mild back pain",
        "dizzy_mild": "Mild dizziness",
        "chronic_check": "Chronic condition check",
        "refill": "Prescription refill",
    },
    "fr": {
        "airway_issue": "Difficulté à respirer / voie aérienne obstruée",
        "no_pulse": "Pas de pouls / arrêt cardiaque",
        "unresponsive": "Inconscient",
        "seizure_now": "Crise convulsive en cours",
        "blue_lips": "Lèvres / visage bleus",
        "severe_bleeding": "Saignement abondant non contrôlé",
        "stroke_signs": "Signes d'AVC",
        "chest_pain": "Douleur / pression thoracique",
        "short_breath": "Difficulté respiratoire sévère",
        "confused": "Très confus / discours incohérent",
        "allergic_reaction": "Réaction allergique sévère",
        "overdose": "Intoxication / surdosage",
        "severe_headache": "Céphalée soudaine et sévère",
        "one_sided_weakness": "Faiblesse nouvelle d'un côté",
        "vomiting_blood": "Vomissements de sang",
        "major_trauma": "Blessure majeure / gros accident",
        "threatened_limb": "Membre menacé",
        "pregnancy_complication": "Grossesse avec douleur ou saignement",
        "fever_stiff_neck": "Fièvre avec raideur de la nuque",
        "moderate_breathing": "Respiration plus difficile que d'habitude",
        "moderate_belly_pain": "Douleur abdominale qui s'aggrave",
        "injury_needs_stitches": "Plaie pouvant nécessiter des points de suture",
        "fever_chills": "Fièvre avec frissons",
        "can_not_walk": "Impossible de marcher ou se tenir debout correctement",
        "rash_spreading": "Éruption qui s'étend",
        "painful_swollen_joint": "Articulation très douloureuse et gonflée",
        "urine_pain_blood": "Douleur ou sang à la miction",
        "eye_injury": "Blessure oculaire / changement de vision",
        "sexual_assault": "Agression sexuelle",
        "animal_bite": "Morsure d'animal / exposition",
        "ear_severe_pain": "Douleur auriculaire sévère",
        "child_not_drinking": "L'enfant ne boit pas ou ne mange pas",
        "mild_pain": "Douleur légère",
        "sore_throat_cold": "Mal de gorge / symptômes de rhume",
        "itchy_rash": "Éruption légère ou démangeaisons",
        "small_cut": "Petite coupure ou ecchymose",
        "nausea_no_vomit": "Nausées sans vomissements",
        "mild_fever": "Fièvre légère",
        "back_pain_mild": "Douleur lombaire légère",
        "dizzy_mild": "Vertige léger",
        "chronic_check": "Suivi d'une maladie chronique",
        "refill": "Renouvellement d'ordonnance",
    },
    "zh": {
        "airway_issue": "呼吸困难 / 气道阻塞",
        "no_pulse": "无脉搏 / 心搏骤停",
        "unresponsive": "无反应",
        "seizure_now": "正在抽搐",
        "blue_lips": "嘴唇 / 面色发青",
        "severe_bleeding": "大量无法控制的出血",
        "stroke_signs": "类似中风的表现",
        "chest_pain": "胸痛 / 胸闷",
        "short_breath": "严重呼吸困难",
        "confused": "非常混乱 / 说话不清",
        "allergic_reaction": "严重过敏反应",
        "overdose": "中毒 / 过量",
        "severe_headache": "突然严重头痛",
        "one_sided_weakness": "一侧新出现无力",
        "vomiting_blood": "呕血",
        "major_trauma": "重大外伤 / 严重事故",
        "threatened_limb": "肢体受威胁",
        "pregnancy_complication": "妊娠并发症 / 出血或疼痛",
        "fever_stiff_neck": "发热伴颈部僵硬",
        "moderate_breathing": "呼吸比平时更困难",
        "moderate_belly_pain": "腹痛加重",
        "injury_needs_stitches": "可能需要缝合的伤口",
        "fever_chills": "发热伴寒战",
        "can_not_walk": "无法正常行走或站立",
        "rash_spreading": "新出现皮疹正在扩散",
        "painful_swollen_joint": "关节明显疼痛肿胀",
        "urine_pain_blood": "排尿疼痛或尿血",
        "eye_injury": "眼部损伤 / 视力变化",
        "sexual_assault": "性侵",
        "animal_bite": "动物咬伤 / 暴露",
        "ear_severe_pain": "严重耳痛",
        "child_not_drinking": "孩子不喝水或不进食",
        "mild_pain": "轻度疼痛",
        "sore_throat_cold": "咽痛 / 感冒症状",
        "itchy_rash": "轻度皮疹或瘙痒",
        "small_cut": "小伤口或瘀伤",
        "nausea_no_vomit": "恶心但未呕吐",
        "mild_fever": "轻度发热",
        "back_pain_mild": "轻微背痛",
        "dizzy_mild": "轻微头晕",
        "chronic_check": "慢性病随访",
        "refill": "续方",
    },
}

CTAS_SECTION_TITLES = {
    "en": {"red": "Critical", "yellow": "Urgent", "high_risk_trauma": "High-risk trauma"},
    "fr": {"red": "Critique", "yellow": "Urgent", "high_risk_trauma": "Traumatisme à haut risque"},
    "zh": {"red": "危急", "yellow": "紧急", "high_risk_trauma": "高风险创伤"},
}


CRITICAL_LOOK_KEYS = {"airway_issue", "no_pulse", "unresponsive", "seizure_now", "blue_lips", "severe_bleeding"}


def _normalize_items(items: Any) -> List[str]:
    if not isinstance(items, list):
        return []
    return [str(item).strip() for item in items if str(item).strip()]


def _localize_label(key: str, language: str) -> str:
    return CTAS_LABELS.get(language, CTAS_LABELS["en"]).get(key, key.replace("_", " ").title())


def _localize_level_info(level: int, language: str) -> Dict[str, str]:
    return CTAS_LEVELS_I18N.get(language, CTAS_LEVELS_I18N["en"]).get(level, CTAS_LEVELS_I18N["en"][5])


def evaluate_ctas(payload: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    symptoms = _normalize_items(payload.get("symptoms"))
    chief = str(payload.get("chief_complaint", "")).strip()
    pain_score = max(0, min(10, int(payload.get("pain_score", 0) or 0)))
    age = int(payload.get("age", 0) or 0)

    selected_keys = []
    for key in symptoms:
        if key in CTAS_MAP:
            selected_keys.append(key)

    if chief in CTAS_MAP and chief not in selected_keys:
        selected_keys.append(chief)

    matched = [key for key in selected_keys if key in CTAS_MAP]
    raw_level = 5
    matched_labels = []
    for key in matched:
        rule = CTAS_MAP[key]
        matched_labels.append(rule["label"])
        raw_level = min(raw_level, rule["level"])

    if any(key in CRITICAL_LOOK_KEYS for key in matched):
        raw_level = 1
    elif pain_score >= 9 and raw_level > 2:
        raw_level = 2
    elif pain_score >= 7 and raw_level > 3:
        raw_level = 3
    elif pain_score >= 4 and raw_level > 4:
        raw_level = 4

    if payload.get("airway_breathing_circulation_issue"):
        raw_level = 1

    if raw_level == 5 and pain_score >= 7:
        raw_level = 4 if pain_score < 9 else 3

    level_info = _localize_level_info(raw_level, language)
    return {
        "level": raw_level,
        "level_name": level_info["name"],
        "priority": level_info["priority"],
        "destination": level_info["destination"],
        "reassessment": level_info["reassessment"],
        "summary": level_info["summary"],
        "matched": matched,
        "matched_labels": [_localize_label(key, language) for key in matched],
        "pain_score": pain_score,
        "age": age,
        "modifiers": {
            "critical_look": bool(payload.get("critical_look")),
            "pain": pain_score,
            "vital_signs": payload.get("vitals", {}),
            "reassessment_due": level_info["reassessment"],
        },
        "documentation": {
            "presenting_complaint": chief,
            "subjective": payload.get("subjective", ""),
            "objective": payload.get("objective", ""),
            "first_order_modifiers": payload.get("first_order_modifiers", []),
            "second_order_modifiers": payload.get("second_order_modifiers", []),
        },
    }


def build_ctas_response(payload: Dict[str, Any]) -> Dict[str, Any]:
    ctas = evaluate_ctas(payload, payload.get("language", "en"))
    return {
        "success": True,
        "ctas_result": ctas,
        "workflow": [
            "Critical look",
            "Infection screening",
            "Triage assessment",
            "Presenting complaint selection",
            "Modifier review",
            "CTAS level assignment",
            "Destination assignment",
            "Reassessment planning",
        ],
        "operational_notes": {
            "triage_timing": "Ideally within 10 to 15 minutes of arrival",
            "retriage": "Document any change, but keep the original triage level intact",
            "overcrowding": "Move critically ill patients forward and watch for triage drift",
        },
    }


@triage_bp.route("/schema", methods=["GET"])
@require_auth
def schema() -> Tuple[Dict[str, Any], int]:
    language = request.args.get("lang", "en")
    return jsonify(get_ctas_schema(language)), 200


def _build_schema(language: str) -> Dict[str, Any]:
    labels = CTAS_LABELS.get(language, CTAS_LABELS["en"])
    section_titles = CTAS_SECTION_TITLES.get(language, CTAS_SECTION_TITLES["en"])

    def item(key: str) -> Dict[str, str]:
        return {"key": key, "label": labels.get(key, key.replace("_", " ").title())}

    adult = {
        "red": {
            "airway_breathing": [item("unresponsive"), item("airway_issue"), item("blue_lips"), item("severe_bleeding")],
            "circulation": [item("no_pulse"), item("chest_pain"), item("threatened_limb")],
            "disability": [item("seizure_now"), item("confused"), item("stroke_signs")],
            "other": [item("major_trauma"), item("overdose"), item("allergic_reaction"), item("pregnancy_complication")],
        },
        "yellow": {
            "airway_breathing": [item("short_breath"), item("fever_stiff_neck")],
            "circulation": [item("moderate_belly_pain"), item("can_not_walk"), item("vomiting_blood")],
            "disability": [item("severe_headache"), item("one_sided_weakness")],
            "other": [item("injury_needs_stitches"), item("rash_spreading"), item("animal_bite"), item("sexual_assault")],
        },
        "high_risk_trauma": [item("major_trauma"), item("threatened_limb")],
    }

    pediatric = {
        "red": {
            "airway_breathing": [item("unresponsive"), item("airway_issue"), item("blue_lips"), item("severe_bleeding")],
            "circulation": [item("no_pulse"), item("dehydration"), item("threatened_limb")],
            "disability": [item("seizure_now"), item("confused"), item("stroke_signs")],
            "other": [item("child_not_drinking"), item("overdose"), item("major_trauma"), item("pregnancy_complication")],
        },
        "yellow": {
            "airway_breathing": [item("short_breath"), item("fever_stiff_neck")],
            "circulation": [item("moderate_belly_pain"), item("can_not_walk"), item("vomiting_blood")],
            "disability": [item("severe_headache"), item("one_sided_weakness")],
            "other": [item("injury_needs_stitches"), item("rash_spreading"), item("animal_bite"), item("sexual_assault")],
        },
        "high_risk_trauma": [item("major_trauma"), item("threatened_limb")],
    }

    return {
        "success": True,
        "adult": adult,
        "pediatric": pediatric,
        "meta": {
            "section_titles": section_titles,
        },
    }


def get_ctas_schema(language: str) -> Dict[str, Any]:
    return _build_schema(language)
