
var socket = io.connect('');
var mySocketId;
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
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.value) {
      swal(
        'Deleted!',
        'Your file has been deleted.',
        'success'
      )
    }
  })

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
  }).then((result) => {
    // if (result.dismiss === 'timer') {
      console.log('상대방이 응답하지 않아 취소됐습니다!')
    // }
  })
}
