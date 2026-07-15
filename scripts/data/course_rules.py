"""서울 여행코스 제목 기반 태그 분류 및 추천 점수 규칙."""

from __future__ import annotations

MAX_TAGS = 4


# 딕셔너리 순서를 태그 우선순위로 사용한다.
TAG_KEYWORDS: dict[str, tuple[str, ...]] = {
    "역사": (
        "태조",
        "이성계",
        "조선",
        "종묘",
        "사직",
        "숭례문",
        "한양",
        "궁궐",
        "500년",
        "역사",
        "과거",
        "조선시대",
        "궁의",
        "왕들",
        "유적",
        "순교성지",
        "3·1운동",
        "3.1운동",
        "옛 서울",
        "성곽길",
        "어제와 오늘",
        "고택",
        "경복궁",
    ),
    "자연": (
        "하이드파크",
        "호수공원",
        "벚꽃",
        "꽃길",
        "샛강",
        "도시 숲",
        "들꽃",
        "수목원",
        "남산 자락",
        "꿈의 숲",
        "불암산",
        "청계천",
    ),
    "맛집": ("먹는", "밥상", "맛산책", "맛집", "멋과 맛"),
    "문화예술": ("미술관", "문화놀이", "문화 유적", "예술가"),
    "야경": ("밤", "야경"),
    "산책": (
        "돌아보기",
        "거닐다",
        "꽃길",
        "걷는 길",
        "부암동길",
        "맛산책",
        "길을 따라 걷다",
        "성곽길을 따라 걷기",
    ),
    "도심여행": (
        "시티투어",
        "서울여행",
        "랜드마크",
        "도심",
        "명동",
        "이태원",
        "동대문 투어",
        "도시",
        "빌딩 숲",
        "강남",
        "관광특구",
    ),
    "체험": ("놀거리", "문화놀이", "아쿠아리움", "체험"),
    "혼자": ("싱글", "혼자", "나홀로"),
    "연인": ("연인", "커플", "데이트"),
    "가족": ("가족", "아이와", "부모님", "자녀"),
    "친구": ("친구", "우정"),
}


def normalize_text(value: str | None) -> str:
    """문자열 비교를 위해 앞뒤·연속 공백과 영문 대소문자를 정리한다."""
    if not value:
        return ""

    return " ".join(str(value).strip().casefold().split())


def infer_tags(title: str) -> list[str]:
    """제목에 직접 포함된 키워드로 최대 4개의 태그를 생성한다."""
    normalized_title = normalize_text(title)
    if not normalized_title:
        return []

    inferred_tags: list[str] = []
    for tag, keywords in TAG_KEYWORDS.items():
        if any(normalize_text(keyword) in normalized_title for keyword in keywords):
            inferred_tags.append(tag)

        if len(inferred_tags) >= MAX_TAGS:
            break

    return inferred_tags
