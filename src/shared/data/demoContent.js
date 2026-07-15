import bukchonImage from '../../assets/images/course-bukchon.jpg'
import namsanImage from '../../assets/images/course-namsan.jpg'
import hangangImage from '../../assets/images/course-hangang.jpg'
import seoulImage from '../../assets/images/hero-seoul.jpg'

export const featuredCourses = [
  {
    key: 'demo-hangang', id: 'demo-hangang', title: '한강 노을 산책 코스',
    description: '여의도 한강공원에서 노을을 감상하고 감성 카페까지!',
    region: { code: '1', name: '서울', districtCode: '영등포구' },
    tags: ['노을', '산책', '카페', '한강'], imageUrl: hangangImage,
    imageAlt: '노을빛 한강과 서울 도심', duration: '약 3시간', transport: '도보 중심',
    rating: 4.8, reviews: 256, latitude: 37.5283, longitude: 126.9326,
  },
  {
    key: 'demo-bukchon', id: 'demo-bukchon', title: '북촌 한옥마을 감성 산책 코스',
    description: '전통과 현대가 공존하는 북촌에서 여유롭게 산책해보세요.',
    region: { code: '1', name: '서울', districtCode: '종로구' },
    tags: ['한옥', '문화', '카페', '사진명소'], imageUrl: bukchonImage,
    imageAlt: '노을 아래 북촌 한옥마을 골목', duration: '약 3시간', transport: '도보',
    rating: 4.7, reviews: 189, latitude: 37.5826, longitude: 126.9831,
  },
  {
    key: 'demo-namsan', id: 'demo-namsan', title: '남산 야경 데이트 코스',
    description: '남산케이블카를 타고 서울의 야경과 맛집을 함께 즐겨요.',
    region: { code: '1', name: '서울', districtCode: '용산구' },
    tags: ['야경', '전망대', '맛집', '커플'], imageUrl: namsanImage,
    imageAlt: '서울 야경과 남산서울타워', duration: '약 4시간', transport: '대중교통',
    rating: 4.9, reviews: 312, latitude: 37.5512, longitude: 126.9882,
  },
  {
    key: 'demo-city', id: 'demo-city', title: '도심 디자인 & 쇼핑 코스',
    description: '서울의 감각적인 건축과 쇼핑 스폿을 한 번에 만나보세요.',
    region: { code: '1', name: '서울', districtCode: '중구' },
    tags: ['전시', '쇼핑', '도심', '트렌디'], imageUrl: seoulImage,
    imageAlt: '서울 도심 야경', duration: '반나절', transport: '대중교통',
    rating: 4.6, reviews: 142, latitude: 37.5665, longitude: 127.0092,
  },
]
