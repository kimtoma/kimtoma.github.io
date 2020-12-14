---
layout: post
title: Color Contrast 체크하기 🚥

---

### Sketch로 UI 디자인 작업을 하고 있다면 Stark 플러그인을 써서 명도대비를 체크해서 컨텐츠 접근성을 높여보아요.

디지털 디바이스를 통해 제공하는 컨텐츠는 다양한 사용자가 접근하기 쉽고 편하게 볼 수 있도록 웹 컨텐츠 접근성 가이드라인([WCAG](https://www.w3.org/TR/WCAG21/#contrast-minimum)) 기준에 맞춰 UI 요소를 디자인하는 것이 좋은데 이걸 일일이 계산하자니 너무 힘이 든다… 

하지만 눈물젖은 디자이너들을 어여삐여겨 만들어진 Sketch Plugin이 있으니 그 이름하여…

[![img](https://kimtoma.github.io/media/2020/04/stark.png?w=819)](https://www.getstark.co/?ref=kimtoma.com)

Stark

그렇다면 실무에서는 어떻게 사용할까?!

------

**🤔How to…?!**

![img](https://kimtoma.github.io/media/2020/04/01_plugin.png?w=1024)

1️⃣ Sketch에서 CTA 버튼이나 주요 컨텐츠의 BG와 Text 레이어를 함께 선택한 후에 [Stark 플러그인](https://www.getstark.co/?ref=kimtoma.com)으로 Check Contrast를 실행한다.
( ⌨️ : Shift + Cmd + P )

![img](https://kimtoma.github.io/media/2020/04/02_results.png?w=1024)

2️⃣결과값을 확인해서 BG와 Text 레이어의 컬러와 명도를 보정하면 끝!
( 최소 4.5 : 1 / 큰글자는 3 : 1 )

------

급 궁금해져서 절찬리(?)에 서비스되고 있는 모바일 앱 중에서 “**Blue 컬러 계열의 CTA 버튼**“은 얼마나 명도대비를 잘 지키고 있나 간단히 테스트해봤다.

![img](https://kimtoma.github.io/media/2020/04/02_color-contrast_cta_blue_1.png?w=999)PAIGE와 네이버, 페이스북의 CTA버튼

![img](https://kimtoma.github.io/media/2020/04/02_color-contrast_cta_blue_2.png?w=998)G마켓과 쿠팡, 토스의 CTA 버튼

- PAIGE : **4.02** : 1 **개선필요**
- 네이버 : **5.45** : 1 **통과**
- 페이스북 : **6.71**:1 **통과**
- G마켓 : **3.47**:1 **개선필요**
- 쿠팡 : **4.54**:1 **통과**
- 토스 : **3.71**:1 **개선필요**

얼핏 보기에는 “**파랑 배경에 하얀 글씨**“가 크게 다르지 않아 보일 수 있는 버튼도 실제로 체크해보니 미묘&미세하게 명도대비가 달라서 개선이 필요한 부분을 찾을 수 있었다.

블루계열은 한색인 반면 난색 계열의 카카오 옐로우 군단이 출동한다면?!

![img](https://kimtoma.github.io/media/2020/04/02_color-contrast_cta_yellow.png?w=1024)카카오톡 쇼핑하기, 카카오뱅크, 카카오톡 선물하기, 카카오페이의 CTA 버튼

- 카카오톡 쇼핑하기 : 17.1 : 1 **통과**
- 카카오뱅크 : 15.98:1 **통과**
- 카카오톡 선물하기 : 14.97:1 **통과**
- 카카오페이 : 12.7:1 **통과**

역시 엄청 높은 컬러 명도대비를 보여주면서 모두 통과… ㄷ ㄷ ㄷ 

대부분의 서비스들이 브랜드의 메인 컬러를 사용했는데, 브랜딩 컬러가 컨텐츠의 접근성에도 영향을 줄 수 있다는 사실도 덤으로 알게 되었다.

p.s) 작업하면서 계속 체크하긴 어렵고 디자인 시안이 1벌 마무리 됐을 때 체크하는 습관을 들이면 좋을 듯!

------

**참고링크**

- WCAG : https://www.w3.org/TR/WCAG21/#contrast-minimum
- K-WCAG : https://www.wah.or.kr:444/Participation/guide.asp
- 스케치 플러그인 : https://www.getstark.co/