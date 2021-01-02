---
layout: post
title: UI에서 날짜, 시간 표기는 어떻게 하는게 좋을까?

---

### 국제 표준(ISO 8601)을 지켜서 표기하는 것이 가장 좋으나,  서비스 기획 의도와 최종 디자인에 따라 가변적으로 구성할 수 있음

## **1. 상대시간 (Relative Time)**

![date&time](https://kimtoma.com/media/2021/01/date&time.png)

- 주로 사용자가 작성하거나 참여한 콘텐츠에 사용
- 콘텐츠를 최신 순으로 보여주는 타임라인이나 피드에 적용하면 좋음

| 업데이트 기간               | 표기 방식 | 적용 예시            |
| --------------------------- | --------- | -------------------- |
| 1초 이내                    | 방금      | 방금                 |
| 1초 부터 60초 전            | n초 전    | 1초 전 ~ 59초 전     |
| 1분 부터 60분 전            | n분 전    | 1분 전 ~ 59분 전     |
| 1시간 부터 24시간 전        | n시간 전  | 1시간 전 ~ 23시간 전 |
| 24시간 부터 7일(168시간) 전 | n일 전    | 1일 전 ~ 6일 전      |
| 7일 부터 30일 전            | n주 전    | 1주 전 ~ 4주 전      |
| 30일 부터 365일 전          | n달 전    | 1달 전 ~ 11달 전     |
| 365일 이후                  | n년 전    | 1년 전 ~ 999년 전    |





## 2**. 절대시간 (Absolute Time)**

- 주로 서비스에서 제공하거나 정보를 전달하는 콘텐츠에 사용
- 공지사항이나 콘텐츠 상세화면의 작성일자 등에 적용하면 좋음

### **1. 국제 표준 (ISO 8601)**

- **양력(그레고리력)**으로 표기함
- 일주일의 시작 요일 = 월요일 (일반적인 설정은 일요일)
- 날짜 = YYYY-MM-DD (2020-08-15)
- 시간 = HH:MM:SS (18:01:26)
- 날짜+시간 : YYYY-MM-DDTHH:MM:SS (2020-08-15T14:07:35)
- 날짜+요일+시간 : 표준없음

### **2. 국문 표기법**

- **시작 요일** : 일요일
- **12시간제**
  - 날짜 : 2020-08-15
  - 날짜 : 2020년 8월 15일 토요일
  - 시간 : 오후 2:07
  - 시간 : 오후 2:07:35
  - 날짜+시간 : 2020년 8월 15일, 오후 2:07:35
  - 날짜+요일+시간 : 2020년 8월 15일, 토요일, 오후 2:07:35, 2020년 8월 15일(토), 오후 2:07:35
- **24시간제**
  - 날짜 : 2020-08-15
  - 날짜 : 2020년 8월 15일
  - 시간 : 14:07
  - 시간 : 14:07:35
  - 날짜+시간 : 2020년 8월 15일, 14:07:35
  - 날짜+요일+시간 : 2020년 8월 15일, 토요일, 14:07:35 2020년 8월 15일(토), 14:07:35

### **3. 영문 표기법 (미국기준)**

- **12-hour clock**
  - Date : 15 August 2020
  - Time : 2:07:35 PM
  - Date + Time : 15 August 2020, 2:07:35 PM
  - Date + Day + Time : 15 August 2020, Saturday, 2:07:35 PM
- **24-hour clock**
  - Date : 15 Aug 2020
  - Date : 15 August 2020
  - Time : 14:07:35
  - Date + Time : 15 Aug 2020, 14:07:35
  - Date + Time : 15 August 2020, 14:07:35
  - Date + Day + Time : 15 Aug 2020, Sat, 14:07:35
  - Date + Day + Time : 15 August 2020, Saturday, 14:07:35

### **4. 공문서 표기법**

- 날짜
  - 숫자 자릿수를 맞추기 위한 “0”은 표기하지 않음
  - 1. 1. 1. (O)
  - 1. 1. 1. (X)
- 기간
  1. 1. 1.~2020. 8. 15. (물결 붙여서 쓰기)

------

- 참고 링크
  - https://www.iso.org/standard/70907.html
  - https://www.iso.org/standard/70908.html
  - https://www.w3.org/TR/NOTE-datetime
  - https://material.io/design/communication/data-formats.html#date-time
  - https://ko.wikipedia.org/wiki/ISO_8601
  - https://www.ibm.com/support/knowledgecenter/SSLVMB_24.0.0/spss/base/syn_date_and_time_date_time_formats.html
  - https://docs.microsoft.com/ko-kr/dotnet/standard/base-types/standard-date-and-time-format-strings
  - https://devhints.io/moment#formatting
  - https://momentjs.com/