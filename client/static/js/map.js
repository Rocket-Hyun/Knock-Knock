
var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.5666805, 126.9784147),
    zoom: 5,
    mapTypeId: naver.maps.MapTypeId.NORMAL
});

var markers = [];
var current_marker;
var current_circle;

var GREEN_FACTORY = new naver.maps.LatLng(37.3595953, 127.1053971);

// var infowindow = new naver.maps.InfoWindow();



// 현재 위치 받아오는 함수
function onSuccessGeolocation(position) {
    var location = new naver.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);

    map.setCenter(location); // 얻은 좌표를 지도의 중심으로 설정합니다.
    map.setZoom(10); // 지도의 줌 레벨을 변경합니다.

    var markerOptions = {
        position: location,
        map: map
        // 커스텀 아이콘
        // icon: {
        //     // url: './img/pin_default.png',
        //     size: new naver.maps.Size(22, 35),
        //     origin: new naver.maps.Point(0, 0),
        //     anchor: new naver.maps.Point(11, 35)
        // }
    };

    // 최초 1회만 마커와 빨간 원 찍기
    if (current_marker == undefined) {

      // 현재 위치 찍기
      var marker = new naver.maps.Marker(markerOptions);
      current_marker = marker;

      // 현재 위치 근처 원그리기
      // https://navermaps.github.io/maps.js/docs/tutorial-Shape.html
      var circle = new naver.maps.Circle({

          map: map,
          center: location,
          radius: 500,

          strokeColor: '#5347AA',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: '#E51D1A',
          fillOpacity: 0.3
      });

      current_circle = circle;

    } else {
      //  이후부터는 기존 마커/원의 위치 변경
      current_marker.setPosition(location);
      current_circle.setCenter(location);

      socket.emit('fromclient1',{msg:current_marker.getPosition()});
    }


    // infowindow.setContent('<div style="padding:20px;">' +
    //     'latitude: '+ location.lat() +'<br />' +
    //     'longitude: '+ location.lng() +'</div>');

    // infowindow.open(map, location);
}

function onErrorGeolocation() {
    var center = map.getCenter();

    // infowindow.setContent('<div style="padding:20px;">' +
    //     '<h5 style="margin-bottom:5px;color:#f00;">Geolocation failed!</h5>'+ "latitude: "+ center.lat() +"<br />longitude: "+ center.lng() +'</div>');

    // infowindow.open(map, center);
}

// 현재 위치를 받아와서 마커를 업데이트하는 함수
function currentPositionUpdate () {
   if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation);
   } else {
       var center = map.getCenter();

       // infowindow.setContent('<div style="padding:20px;"><h5 style="margin-bottom:5px;color:#f00;">Geolocation not supported</h5>'+ "latitude: "+ center.lat() +"<br />longitude: "+ center.lng() +'</div>');
       // infowindow.open(map, center);
   }
}

// 현재위치찍는 함수와 업데이트 event listener 등록하는 함수
$(window).on("load", function(){
  navigator.geolocation.watchPosition(success, error, options);
  currentPositionUpdate();
});


// 위치가 변경되면 실행되는 함수
var id, target, options;
function success(pos) {
  // var crd = pos.coords;
  //
  // if (target.latitude === crd.latitude && target.longitude === crd.longitude) {
  //   console.log('Congratulations, you reached the target');
  //   navigator.geolocation.clearWatch(id);
  // }

  console.log("Geo Changed!!");
  currentPositionUpdate();
}
function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}
// target = {
//   latitude : 0,
//   longitude: 0
// };
//
// options = {
//   enableHighAccuracy: false,
//   timeout: 5000,
//   maximumAge: 0
// };




// 샘플 마커 찍기
// console.log(current_marker.getPosition());
var sampleMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.5614117, 126.93994470000001),
    map: map
});
markers.push(sampleMarker);

var sampleMarker2 = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.562117, 126.94094470000001),
    map: map

});
markers.push(sampleMarker2);

// 마커 클릭 이벤트
function getClickHandler(seq) {
    return function(e) {
        var marker = markers[seq];
        console.log(marker);
    }
}

for (var i=0, ii=markers.length; i<ii; i++) {
    naver.maps.Event.addListener(markers[i], 'click', getClickHandler(i));
}
