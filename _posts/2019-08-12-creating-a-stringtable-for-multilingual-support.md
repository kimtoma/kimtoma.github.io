---
layout: post
title: 다국어 대응을 위한 String Table 작성하기

---

### 다국어 대응을 위해서 애플리케이션에 사용되는 문구를 국가별로 관리하는 산출물인 스트링 테이블에 대해 간단히 알아보자.

**String Table이란?**

- 다국어 대응을 위해서 국가별로 애플리케이션에 사용되는 문구를 관리하는 산출물
- 보통 스프레드시트 형식으로 제작 (xlsx, csv)

**Key 값 (ID)**

- 영문 대문자와 언더스코어(_)로만 작성
- 길이 제한은 255자 이내
- Key 값만 봐도 대략 어디에 어떤 곳에 적용된 text 인지 알 수 있게 작성
- 작성하는 순서는 <WHERE?> < WHAT? > < DESCRIPTION > < SIZE >에 맞춰서 작성
- < 어떤 화면 > < 어떤 컴포넌트 > < 어떤 내용 > < 어떤 크기 >
- 동일한 문구라도 기능이 다르면 별도의 Key로 작성
- 변동될 수 있는 비즈니스 로직과 관련된 내용은 key 값에 표시안함 (예시: 사용자 레벨(owner, admin, user)에 따라 기능을 다르게 제공해도 key 값에는 별도로 표시 안함)
- 중복되는 ID 있는지 체크하기
  - 구글 스프레드시트로 작성한 경우 중복 체크하는 플러그인으로 확인 후 수정
  - https://chrome.google.com/webstore/detail/power-tools/dofhceeoedodcaheeoacmadcpegkjobi?utm_source=permalink

**Value 내용 작성**

- 줄바꿈 : \n
- 변동되는 문자 값 : %s (= string, 문자열)
- 변동되는 숫자 값 : %d (= decimal, 10진법의 수)