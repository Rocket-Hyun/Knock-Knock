# Knock-Knock

위치기반 랜덤 채팅 서비스입니다.

### 요구사항

- Node.js : 서비스를 운영하기 위해서는 Node.js 설치가 필요합니다.
- 3000번 포트 : 3000번 포트가 가용한 상태여야 합니다.
- TSL(SSL) : 사용자로부터 위치를 얻어오기 위해서는 Secure HTTP의 사용이 필요합니다.
TSL(SSL)을 이용해 HTTPS를 이용하도록 코드를 작성하였으며, Git에 이를 위한 인증키들도 포함이 되어 있습니다.
다만, 이 서비스를 운영하는 서버 환경에 맞게 인증키를 재발급 받아야할 필요가 있을 수 있습니다.


### 설치 및 구동

먼저 Git을 복사합니다.

```
git clone https://github.com/Rocket-Hyun/Knock-Knock.git
cd Knock-Knock
```

서비스를 운영하는 서버에 맞게 IP를 수정해야 합니다.
```
cd server\public\js
vi socketio.js
```

1번째 줄의
```
var socket = io.connect('https://52.79.47.10:3000');
```
52.79.47.10 부분을 운영하는 서버의 IP로 수정합니다.

수정 후 server 폴더 안에서 다음 명령어를 수행합니다.

```
cd ../../
node app.js
```

## 작동 확인

둘 이상의 기기로 서비스에 접속하여 정상적으로 채팅을 할 수 있는지 확인합니다.

## 제작 기반

* [NodeJS](https://nodejs.org/) - 웹 서버
* [SweetAlert2](https://limonte.github.io/sweetalert2/) - 메시지 알림창
* [socket.io](https://socket.io/) - 실시간으로 메시지를 주고받기 위한 모듈

## 제작

* **박정현(20120863)** - *네이버 지도 API를 이용한 위치 출력과 채팅창 생성 기능 구현* - [Rocket-Hyun](https://github.com/Rocket-Hyun)
* **장정훈(20121634)** - *채팅 메시지를 주고받는 기능과 채팅 UI 구현* - [jh95kr2004](https://github.com/jh95kr2004)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
