export const getCookie = cookieName => {
    var strCookie = document.cookie;
    var arrCookie = strCookie.split('; ');
    for (var i = 0; i < arrCookie.length; i++) {
        var arr = arrCookie[i].split('=');
        if (cookieName == arr[0]) {
            return decodeURI(arr[1]);
        }
    }
    return ''
}
