---
layout: post
title: Jira 간단 사용법

---

### 아틀라시안의 이슈관리용 S/W인 Jira의 사용법을 간단하게 야매로 정리해봤습니다.

<hr/>

![img](https://kimtoma.github.io/media/2019/10/icon-jira.png)

[Jira](https://www.atlassian.com/software/jira)는 Atlassiand에서 만든 일정과 Issue를 관리하는 협업용 S/W입니다. 정석은 아니고 속성으로 배운 Jira 사용법을 정리하기 위해 작성한 내용입니다.



### 1. 주요 메뉴

- **로드맵** = Epic 단위로 일정이 표시됨
- **백로그** = Story와 Issue가 목록으로 표시됨 (담당자와 해당되는 에픽, 마감기한이 함께 표시됨)
- **보드** = Story와 Issue의 진행상태가 칸반보드 방식으로 표시됨
- **페이지** = Confluence에 등록된 문서가 표시됨



### 2. 개념 정리 (Epic - Story - Issue)

<mark>**Epic**</mark>

- [UX] 앱 UI 디자인 (v1.0)

  - <mark>**Story**</mark>

  - UX 가이드라인 정의 스펙 작성
  - <mark>**Issue**</mark> = 스토리를 이행하기 위한 주요 Task 
    - Plugins & Account 요구사항 작성
    - Projects 요구사항 작성
    - 이메일 템플릿 제작
    - …
  - Q/A 검증사항 확인 후 반영하기
  - 스트링 테이블 정리

- [UX] 홈페이지 UI 디자인

  - 컨텐츠 정리
  - Wireframe

- [UX] 운영사이트 UI 디자인

  - 요구사항 작성

- [UX] 사용 가이드 & 샘플 제작

- [UX] 디자인 시스템 제작



### 3. 보드 단계 및 사용법

- **To-do** : 나에게 지정된 Story와 Issue가 표시됨
- **On going** : 현재 작업중
- **Feedback** : 작업 내용 중 다른 파트나 사용자에게 피드백이나 확인이 필요한 상태
- **Pending** : 작업진행하다가 멈춰진 내용 (멈춰진 이유도 간단히 작성해놓기)
- **Done** : 작업 완료
- **Failed** : 작업 완료된 내용 검수했는데 재작업 필요한 경우
- **Pass** : 최종 검수완료



- **담당자A**는 Story, Issue 작업이 완료되면 **Done**으로 변경하고 담당자를 **멤리뷰어B**로 **변경**
- **리뷰어B**는 Done으로 변경된 작업을 리뷰해서 체크한 뒤 **Pass**로 변경 (재작업 필요 시 Fail로 변경)
- UX 산출물 검수나 의사결정이 필요한 내용은 **Done**으로 변경하고 **담당자**를 **QA담당자 또는 PM**으로 변경