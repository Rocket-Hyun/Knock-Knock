
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
});

// 포지션이 변경될 때 소켓ID랑 위치정보를 보냄
function sendPosition(position){
  console.log({socketId: mySocketId, position: position});
  socket.emit('positionUpdate',{socketId: mySocketId, position: position});
}

// 채팅 Request 보내기
function sendRequest(id){
  socket.emit('sendRequest',{requestId:mySocketId, receiveId:id});
}
