var socket = io.connect("https://52.79.47.10:3000");
var mySocketId;
var currentChatId;
var allMarkers = {};

// 내 소켓ID를 등록
socket.on('registerId', function(data){
  console.log(data);
  mySocketId = data.id;
});

socket.on('getPosition',function(data){
  if (allMarkers[data.socketId]) {
    allMarkers[data.socketId].onRemove();
  }
  console.log('받은 데이터: ', data);
  var sampleMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(data.position),
    map: map
  });
  naver.maps.Event.addListener(sampleMarker, 'click', getClickHandler(sampleMarker));
  allMarkers[data.socketId] = sampleMarker;
});

// 로그아웃 할 때
socket.on('deleteMarker', function(data){
  // 소켓 id를 받아야함
  console.log('딜리트 말컬 받은 데이터: ', data);
  // 해당 id의 마커삭제
  allMarkers[data].onRemove();
  delete allMarkers.data;
});

// 채팅 요청 받을 때
socket.on('recieveRequest', function(data){
  console.log("채팅창 요청!");
  console.log(data);

  swal({
    title: '채팅 요청',
    text: data.requestId + "님께서 요청을 보내셨습니다.<br> 수락하시겠습니까?",
    type: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    timer: 5000,

    // 요청을 수락할 경우 result에 true
  }).then((result) => {
    console.log(result);
    // swal(
    //   'Deleted!',
    //   'Your file has been deleted.',
    //   'success'
    // );
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
    // swal.close();

    // 채팅을 수락했다는 브로드케스트를 보냄
    //  이땐 내가 requestID
    currentChatId = data.requestId;
    socket.emit('chatOk',{requestId:mySocketId, receiveId:data.requestId});

    $("button#sendButton").click(function() {
      sendMessage();
    });

    // 요청을 거절할 경우 result에 취소 방법
    // timer / esc / cancel / overlay 등이 result로 옴
  }).catch((result)=>{
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
  console.log({socketId: mySocketId, position: position});
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

function sendMessage() {
  var p = $("<p class='message sendMessage'></p>").text($("#messageInput").val());
  $("div#chatDiv").append(p);
  console.log({requestId:mySocketId, receiveId:currentChatId, sendMessage:$("#messageInput").val()});
  socket.emit('sendMessage', {requestId:mySocketId, receiveId:currentChatId, sendMessage:$("#messageInput").val()});
  $("#messageInput").val("");
}
