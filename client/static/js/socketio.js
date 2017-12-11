
var socket = io.connect('');

// $("#msgbox").keyup(function(event) {
//     if (event.which == 13) {
//         socket.emit('fromclient1',{msg:$('#msgbox').val()+"(junghyun)"});
//         $('#msgbox').val('');
//     }
// });


socket.on('tojunghyun',function(data){
    console.log(data.msg);
    var sampleMarker2 = new naver.maps.Marker({
        position: new naver.maps.LatLng(data.msg),
        map: map
    });
});
