var infowindow = new naver.maps.InfoWindow();

function onSuccessGeolocation(position) {
var location = new naver.maps.LatLng(position.coords.latitude,
  position.coords.longitude);

  map.setCenter(location); // 얻은 좌표를 지도의 중심으로 설정합니다.
  map.setZoom(10); // 지도의 줌 레벨을 변경합니다.

  infowindow.setContent('<div style="padding:20px;">' +
  'latitude: '+ location.lat() +'<br />' +
  'longitude: '+ location.lng() +'</div>');

  infowindow.open(map, location);
}

function onErrorGeolocation() {
  var center = map.getCenter();

  infowindow.setContent('<div style="padding:20px;">' +
  '<h5 style="margin-bottom:5px;color:#f00;">Geolocation failed!</h5>'+ "latitude: "+ center.lat() +"<br />longitude: "+ center.lng() +'</div>');

  infowindow.open(map, center);
}

$(window).on("load", function() {
  var mapDiv = $("div#map")[0];
  var map = new naver.maps.Map(mapDiv, {
    center: new naver.maps.LatLng(37.5666805, 126.9784147),
    zoom: 5,
    mapTypeId: naver.maps.MapTypeId.NORMAL
  });
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation);
  } else {
    var center = map.getCenter();
    infowindow.setContent('<div style="padding:20px;"><h5 style="margin-bottom:5px;color:#f00;">Geolocation not supported</h5>'+ "latitude: "+ center.lat() +"<br />longitude: "+ center.lng() +'</div>');
    infowindow.open(map, center);
  }
});
