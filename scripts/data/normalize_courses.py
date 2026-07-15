import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "1.0"
TRAVEL_COURSE_CONTENT_TYPE_ID = "25"


class NormalizationError(ValueError):
    pass


def clean_string(value: Any) -> str | None:
    if value is None:
        return None

    text = str(value).strip()
    return text or None


def require_string(value: Any, field: str, item_index: int | None = None) -> str:
    text = clean_string(value)
    if text is not None:
        return text

    location = f"items[{item_index}].{field}" if item_index is not None else field
    raise NormalizationError(f"Required field is empty: {location}")


def parse_float(value: Any, field: str, item_index: int) -> float:
    text = require_string(value, field, item_index)
    try:
        return float(text)
    except ValueError as exc:
        raise NormalizationError(
            f"Expected a number at items[{item_index}].{field}: {text!r}"
        ) from exc


def parse_optional_int(value: Any, field: str, item_index: int) -> int | None:
    text = clean_string(value)
    if text is None:
        return None

    try:
        return int(text)
    except ValueError as exc:
        raise NormalizationError(
            f"Expected an integer at items[{item_index}].{field}: {text!r}"
        ) from exc


def parse_timestamp(value: Any, field: str, item_index: int) -> str | None:
    text = clean_string(value)
    if text is None:
        return None

    try:
        return datetime.strptime(text, "%Y%m%d%H%M%S").isoformat(timespec="seconds")
    except ValueError as exc:
        raise NormalizationError(
            f"Expected YYYYMMDDHHmmss at items[{item_index}].{field}: {text!r}"
        ) from exc


def normalize_course(
    item: dict[str, Any],
    item_index: int,
    region_name: str,
    content_type_id: str,
) -> dict[str, Any]:
    course_id = require_string(item.get("contentid"), "contentid", item_index)
    region_code = require_string(item.get("areacode"), "areacode", item_index)
    item_content_type_id = require_string(
        item.get("contenttypeid"), "contenttypeid", item_index
    )

    if item_content_type_id != content_type_id:
        raise NormalizationError(
            "Content type mismatch at "
            f"items[{item_index}].contenttypeid: "
            f"expected {content_type_id!r}, got {item_content_type_id!r}"
        )

    return {
        "key": f"{region_code}-{course_id}",
        "id": course_id,
        "title": require_string(item.get("title"), "title", item_index),
        "region": {
            "code": region_code,
            "name": region_name,
            "districtCode": clean_string(item.get("sigungucode")),
            "legalRegionCode": clean_string(item.get("lDongRegnCd")),
            "legalDistrictCode": clean_string(item.get("lDongSignguCd")),
        },
        "address": clean_string(item.get("addr1")),
        "detailAddress": clean_string(item.get("addr2")),
        "postalCode": clean_string(item.get("zipcode")),
        "phone": clean_string(item.get("tel")),
        "longitude": parse_float(item.get("mapx"), "mapx", item_index),
        "latitude": parse_float(item.get("mapy"), "mapy", item_index),
        "mapLevel": parse_optional_int(item.get("mlevel"), "mlevel", item_index),
        "imageUrl": clean_string(item.get("firstimage")),
        "thumbnailUrl": clean_string(item.get("firstimage2")),
        "category": {
            "mainCode": clean_string(item.get("cat1")),
            "middleCode": clean_string(item.get("cat2")),
            "detailCode": clean_string(item.get("cat3")),
        },
        "tags": [],
        "copyrightType": clean_string(item.get("cpyrhtDivCd")),
        "createdAt": parse_timestamp(
            item.get("createdtime"), "createdtime", item_index
        ),
        "modifiedAt": parse_timestamp(
            item.get("modifiedtime"), "modifiedtime", item_index
        ),
    }


def normalize_document(payload: dict[str, Any]) -> dict[str, Any]:
    region_name = require_string(payload.get("region"), "region")
    content_type_name = require_string(payload.get("contentType"), "contentType")
    content_type_id = require_string(payload.get("contentTypeId"), "contentTypeId")

    if content_type_id != TRAVEL_COURSE_CONTENT_TYPE_ID:
        raise NormalizationError(
            "This script only accepts travel-course data "
            f"(contentTypeId {TRAVEL_COURSE_CONTENT_TYPE_ID}), got {content_type_id!r}"
        )

    items = payload.get("items")
    if not isinstance(items, list):
        raise NormalizationError("Expected items to be an array")

    try:
        declared_total = int(payload.get("total"))
    except (TypeError, ValueError) as exc:
        raise NormalizationError("Expected total to be an integer") from exc

    if declared_total != len(items):
        raise NormalizationError(
            f"Total mismatch: declared {declared_total}, found {len(items)} items"
        )

    courses = []
    seen_keys: set[str] = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise NormalizationError(f"Expected items[{index}] to be an object")

        course = normalize_course(item, index, region_name, content_type_id)
        if course["key"] in seen_keys:
            raise NormalizationError(f"Duplicate course key: {course['key']}")

        seen_keys.add(course["key"])
        courses.append(course)

    return {
        "schemaVersion": SCHEMA_VERSION,
        "contentType": {
            "id": content_type_id,
            "name": content_type_name,
        },
        "total": len(courses),
        "courses": courses,
    }


def normalize_file(input_path: Path, output_path: Path) -> dict[str, Any]:
    if input_path.resolve() == output_path.resolve():
        raise NormalizationError("Input and output paths must be different")

    with input_path.open("r", encoding="utf-8") as source:
        payload = json.load(source)

    if not isinstance(payload, dict):
        raise NormalizationError("Expected the JSON root to be an object")

    normalized = normalize_document(payload)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="\n") as destination:
        json.dump(normalized, destination, ensure_ascii=False, indent=2)
        destination.write("\n")

    return normalized


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Normalize TourAPI travel-course JSON for the CourseOn app."
    )
    parser.add_argument("input", type=Path, help="Path to the raw TourAPI JSON")
    parser.add_argument("output", type=Path, help="Path for the normalized JSON")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        normalized = normalize_file(args.input, args.output)
    except (OSError, json.JSONDecodeError, NormalizationError) as exc:
        parser.exit(1, f"error: {exc}\n")

    missing_images = sum(
        course["imageUrl"] is None for course in normalized["courses"]
    )
    print(f"Normalized {normalized['total']} courses")
    print(f"Missing primary images: {missing_images}")
    print(f"Output: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
