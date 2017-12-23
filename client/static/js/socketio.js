
var socket = io.connect('');
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
  // 요청을 수락할 경우 프로미스
  // 채팅방 알림 창이 뜸
  // result엔 true
  .then((result) => {
    swal({
      html: `
      <h1>채팅방</h1>
      <div style="height:40vh;">
      <p>상대방: ${data.requestId}</p>
      <div id="chatDiv"></div>
      </div>
      <input type="text" id="messageInput">
      <button id="sendButton">Send</button>
      `,
      showCloseButton: true,
      showConfirmButton: false
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
  })

  // 요청을 거절할 경우 result에 취소 방법
  // timer / esc / cancel / overlay 등이 result로 옴
  .catch((result)=>{
    console.log(result);
    if (result == 'cancel') {
      socket.emit('chatRefuse',{requestId:mySocketId, receiveId:data.requestId});
    }
  });

  socket.on('ChatSuccess', function(data){
    console.log('채팅 응답했더니? 데이터가?', data);

    swal.close();
    swal({
      html: `
      <h1>채팅방</h1>
      <div style="height:40vh;">
      <p>상대방: ${data.requestId}</p>
      <div id="chatDiv"></div>
      </div>
      <input type="text" id="messageInput">
      <button id="sendButton">Send</button>
      `,
      showCloseButton: true,
      showConfirmButton: false
    });
    currentChatId = data.requestId;
    $("button#sendButton").click(function() {
      sendMessage();
    });
  });


  socket.on('ChatFail', function(data){
    console.log('채팅 응답했더니? 데이터가?', data);

    swal.close();
    swal(
      'Oops...',
      `${data.requestId}님께서 채팅을 거절하셨습니다..`,
      'error'
    )
  });

});

socket.on("receiveMessage", function(data) {
  var p = $("<p class='message receiveMessage'></p>").text(data);
  $("div#chatDiv").append(p);
});

// 포지션이 변경될 때 소켓ID랑 위치정보를 보냄
function sendPosition(position){
  socket.emit('positionUpdate',{socketId: mySocketId, position: position});
}

// 채팅 Request 보내기
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


  // .then((result) => {
  //   // if (result.dismiss === 'timer') {
  //     // console.log('상대방이 응답하지 않아 취소됐습니다!')
  //   // }
  //   console.log(result);
  // });
}

// 메세지를 보내면 내 채팅 창에 추가가되고 해당 상대방에게 메세지가 가는 함수
function sendMessage() {
  var p = $("<p class='message sendMessage'></p>").text($("#messageInput").val());
  $("div#chatDiv").append(p);
  // sendMessage로 브로드캐스트
  socket.emit('sendMessage', {requestId:mySocketId, receiveId:currentChatId, sendMessage:$("#messageInput").val()});
  $("#messageInput").val("");
}
