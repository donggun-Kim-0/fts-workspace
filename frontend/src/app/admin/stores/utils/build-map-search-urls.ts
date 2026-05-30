/** 계약 브랜드 + 지점명으로 지도 서비스 검색 URL 생성 */
export function buildMapSearchUrls(brandLabel: string, branchName: string) {
  const query = `${brandLabel} ${branchName}`.trim();
  if (!query) return null;

  const encoded = encodeURIComponent(query);

  return {
    naver: `https://map.naver.com/p/search/${encoded}`,
    kakao: `https://map.kakao.com/?q=${encoded}`,
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
  };
}
