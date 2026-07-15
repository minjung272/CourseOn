import bukchonImage from '../../assets/images/course-bukchon.jpg'
import namsanImage from '../../assets/images/course-namsan.jpg'
import hangangImage from '../../assets/images/course-hangang.jpg'
import seoulImage from '../../assets/images/hero-seoul.jpg'
import districtCourses from './districtCourses.json'

const images = { bukchon: bukchonImage, namsan: namsanImage, hangang: hangangImage, seoul: seoulImage }

export const mapCourses = districtCourses.map((course) => ({
  ...course,
  key: course.id,
  description: `${course.district}의 대표 명소를 연결한 추천 코스`,
  region: { code: '1', name: '서울', districtCode: course.district },
  imageUrl: images[course.imageKey],
  imageAlt: `${course.district} ${course.title}`,
}))

export const mapDistricts = mapCourses.map((course) => course.region.districtCode)
