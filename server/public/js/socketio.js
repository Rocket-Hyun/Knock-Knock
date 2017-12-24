var socket = io.connect('https://52.79.47.10:3000');
var mySocketId;
var currentChatId;
var allMarkers = {};

// 내 소켓ID를 mySocketId에 저장
socket.on('registerId', function(data){
  console.log(data);
  mySocketId = data.id;
});

// 누가 접속하거나 위치를 변경하면 실행되는 함수
// 마커를 지우고 새로 찍음
// data로 {socketId: 해당 유저의 socketId, position: 해당 유저의 위치}가 옴
socket.on('getPosition',function(data){
  // 이미 등록된 마커라면 우선 지움
  if (allMarkers[data.socketId]) {
    allMarkers[data.socketId].onRemove();
  }
  console.log(`${data.socketId}님의 위치: ${data.position.x}, ${data.position.y}`);

  // 새로 위치를 받은 마커를 지도에 찍음
  var sampleMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(data.position),
    map: map
  });

  // 해당 마커에 클릭이벤트를 추가하는 함수
  // 클릭이벤트는 해당 마커의 유저에게 채팅 요청을 보내는 이벤트임
  naver.maps.Event.addListener(sampleMarker, 'click', getClickHandler(sampleMarker));
  // allMarkers Object에 방금 추가한 마커를 추가.
  //  key값 해당 유저의 소켓ID / value값 해당 유저의 마커 객체 자체
  allMarkers[data.socketId] = sampleMarker;
});

// 브라우저를 종료 할 때 모든 클라이언트에 오는 브로드캐스트
// 해당 socketId를 가진 마커를 지움
socket.on('deleteMarker', function(socketId){
  console.log('지워야하는 마커의 socketId 값: ', socketId);
  // 해당 id의 마커삭제
  allMarkers[socketId].onRemove();
  // allMarkers 객체에 있는 값도 삭제
  delete allMarkers[socketId];
});


// 상대 유저한테 채팅 요청 받을 때 오는 브로드캐스트
// 팝업이 뜨면서 수락/거절 여부를 선택
// data에는 {requestId: 요청을 보낸 상대방의 socketId, receiveId: 나의 socketId}
socket.on('recieveRequest', function(data){
  console.log("채팅창 요청!");

  // sweetalert2 알림창
  swal({
    title: '채팅 요청',
    text: data.requestId + "님께서 요청을 보내셨습니다.<br> 수락하시겠습니까?",
    type: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',

    // 5초 동안 응답이 없으면 알림창이 꺼짐
    timer: 5000,

  })
  // 내가 요청을 수락할 경우 프로미스
  // 채팅방 알림 창이 뜸
  // result엔 true
  .then((result) => {
    swal({
      html: `
      <h1>채팅방</h1>
	  <p>상대방: ${data.requestId}</p>
      <div id="chatDiv"></div>
      <input type="text" id="messageInput">
      <button id="sendButton">Send</button>
      `,
      showCloseButton: true,
      showConfirmButton: false
    })

    // 채팅을 하다가 취소경우 실행되는 프로미스
    // result에 취소 방법이 리턴됨
    // timer / esc / cancel / overlay 등이 result로 옴
    .catch((result)=>{
      console.log('채팅을 취소하셨습니다: ',result);

      // close을 눌러서 거절 했을 때만 chatRefuse 이벤트 브로드케스트
      // if (result == 'close' || result == 'overlay') {
      socket.emit('chatExit',{requestId:mySocketId, receiveId:data.requestId});
      // }
    });

    // 상대 유저의 chatId를 currentChatId 변수에 담음
    currentChatId = data.requestId;

    // 상대 유저에게 채팅을 수락했다는 브로드케스트를 보냄
    // 이땐 내가 request를 보내는거니 requestId에 mySocketId
    socket.emit('chatOk',{requestId:mySocketId, receiveId:currentChatId});

    // 보내기 버튼을 누르면 메세지가 보내짐
    // sendMeesage함수는 맨 밑에 있음
    $("button#sendButton").click(function() {
      sendMessage();
    });
  	$("input#messageInput").keypress(function(e) {
	  if(e.which == 13) sendMessage();
  	});
  })

  // 요청을 무시 또는 거절할 경우 실행되는 프로미스
  // result에 취소 방법이 리턴됨
  // timer / esc / cancel / overlay 등이 result로 옴
  .catch((result)=>{
    console.log(result);

    // cancel을 눌러서 거절 했을 때만 chatRefuse 이벤트 브로드케스트
    if (result == 'cancel') {
      socket.emit('chatRefuse',{requestId:mySocketId, receiveId:data.requestId});
    }
  });



});

// 내가 요청을 보낸 상황에서 상대방이 수락할 경우 발생하는 이벤트
// data로 {requestId: 요청한 유저의 socketId, receiveId: 내 socketId} 가 옴
socket.on('ChatSuccess', function(data){
  // 로딩 창이 닫힘
  swal.close();

  // 채팅 창이 생성됨
  swal({
    html: `
    <h1>채팅방</h1>
    <div id="container">
    <p>상대방: ${data.requestId}</p>
    <div id="chatDiv"></div>
    </div>
    <input type="text" id="messageInput">
    <button id="sendButton">Send</button>
    `,
    showCloseButton: true,
    showConfirmButton: false
  })

  // 채팅을 하다가 취소경우 실행되는 프로미스
  // result에 취소 방법이 리턴됨
  // timer / esc / cancel / overlay 등이 result로 옴
  .catch((result)=>{
    console.log('채팅을 취소하셨습니다: ',result);

    // close을 눌러서 거절 했을 때만 chatRefuse 이벤트 브로드케스트
    // if (result == 'close' || result == 'overlay') {
    socket.emit('chatExit',{requestId:mySocketId, receiveId:data.requestId});
    // }
  });

  // 상대 유저의 chatId를 currentChatId 변수에 담음
  currentChatId = data.requestId;
  $("button#sendButton").click(function() {
    sendMessage();
  });
  $("input#messageInput").keypress(function(e) {
	if(e.which == 13) sendMessage();
  });
});

// 채팅이 끝났을 때 실행되는 브로드캐스트
socket.on('ChatDone', function(data){
  // 채팅 창이 닫힘
  swal.close();

  // 채팅 창이 생성됨
  swal(
    'Oops...',
    `채팅이 종료되었습니다.`,
    'error'
  )
});


// 상대방이 채팅 거절시 이벤트
// data로 {requestId: 요청한 유저의 socketId, receiveId: 내 socketId} 가 옴
socket.on('ChatFail', function(data){
  // 로딩 창 닫힘
  swal.close();
  swal(
    'Oops...',
    `${data.requestId}님께서 채팅을 거절하셨습니다..`,
    'error'
  )
});

// 상대 유저가 메세지를 보내면 실행되는 함수
// data에 텍스트 자체가 들어있음
socket.on("receiveMessage", function(data) {
  var div = $("<div class='message receiveMessage'><p>" + data + "</p></div>");
  $("div#chatDiv").append(div);
  $("div#chatDiv")[0].scrollTop = $("div#chatDiv")[0].scrollHeight;
});

// 포지션이 변경될 때 소켓ID랑 위치정보를 보냄
function sendPosition(position){
  socket.emit('positionUpdate',{socketId: mySocketId, position: position});
}

// 채팅 Request 보내기
// 대기중
function sendRequest(id){
  socket.emit('sendRequest',{requestId:mySocketId, receiveId:id});
  swal({
    title: '요청을 보냈습니다.',
    text: '대기 중...',
    timer: 5000,
    onOpen: () => {
      swal.showLoading()
    }
  }).catch((result)=>{
    // 채팅창이 꺼지면 실행되는 promise
    // timer / esc / cancel / overlay 등이 result로 옴
    console.log(result);
    swal(
      'Oops...',
      '상대방이 응답하지 않습니다...',
      'error'
    )
  });
}

// 메세지를 보내면 내 채팅 창에 추가가 되고 상대방에게 브로드케스트 하는 함수
function sendMessage() {
  var div = $("<div class='message sendMessage'><p>" + $("#messageInput").val() +"</p></div>");
  $("div#chatDiv").append(div);
  $("div#chatDiv")[0].scrollTop = $("div#chatDiv")[0].scrollHeight;
  // sendMessage로 브로드캐스트
  socket.emit('sendMessage', {requestId:mySocketId, receiveId:currentChatId, sendMessage:$("#messageInput").val()});
  $("#messageInput").val("");
}
