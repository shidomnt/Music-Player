let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
let songsApi = "http://192.168.1.152:3000/songs";
$(".js-audio").volume = 0.5;
let currentSong = 0;
let listSongsLength;
let random = false;
// autoForward();
// handleSeekBar();
// handlePausePlay();
// handleBannerMinimize();
// handleRepeatAndRandomSong();
// renderListSong().then(handleChangeSong);
//Function
function handleSeekBar() {
    $(".js-audio").onloadedmetadata = () =>
        ($(".js-seekBar").max = $(".js-audio").duration);
    $(".js-audio").ontimeupdate = () => {
        $(".js-seekBar").value = $(".js-audio").currentTime;
    };
    $(".js-seekBar").onchange = () => {
        $(".js-audio").currentTime = $(".js-seekBar").value;
    };
}
function handlePausePlay() {
    $(".js-btn-pause-play").onclick = function () {
        if (this.classList.contains("active")) {
            pause();
        } else {
            play();
        }
    };
}
function handleRepeatAndRandomSong() {
    $$(".js-btn-repeat, .js-btn-random").forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (this.classList.contains("active")) {
                this.classList.remove("active");
            } else {
                this.classList.add("active");
            }
        });
    });
    $(".js-btn-repeat").addEventListener("click", function () {
        if ($(".js-audio").getAttribute("loop")) {
            $(".js-audio").removeAttribute("loop");
        } else {
            $(".js-audio").setAttribute("loop", "true");
            if (random) {
                turnOffRandom();
                $(".js-btn-random").classList.remove("active");
            }
        }
    });
    $(".js-btn-random").addEventListener("click", function () {
        if (random) {
            turnOffRandom();
        } else {
            turnOnRandom();
            if ($(".js-audio").hasAttribute("loop")) {
                $(".js-audio").removeAttribute("loop");
                $(".js-btn-repeat").classList.remove("active");
            }
        }
    });
}
function turnOnRandom() {
    $(".js-audio").removeEventListener("ended", toForward);
    $(".js-audio").addEventListener("ended", toRandom);
    random = true;
}
function turnOffRandom() {
    $(".js-audio").removeEventListener("ended", toRandom);
    $(".js-audio").addEventListener("ended", toForward);
    random = false;
}

function renderListSong() {
    return request(songsApi).then(songs => {
        let htmls = "";
        songs.forEach(song => {
            let html = `
            <div class="song" song-id="${song.id}">
                <div class="song-banner-container">
                    <div class="song-banner">
                        <div
                            class="song-banner-bg"
                            style="
                                background: url(${song["banner-url"]})
                                    no-repeat;
                                background-position: center;
                                background-size: cover;
                            "
                        ></div>
                    </div>
                </div>
                <div class="song-content">
                    <h2 class="song-name">${song.name}</h2>
                    <p class="song-singer">
                        ${song.singer}
                    </p>
                </div>
                <div class="song-more-info">
                    <i class="song-more-info-icon fas fa-ellipsis-h"></i>
                </div>
            </div>
        `;
            htmls += html;
        });
        $(".songs-container").innerHTML = htmls;
    });
}
function handleChangeSong() {
    let listSongs = $$(".song");
    listSongsLength = listSongs.length;
    listSongs.forEach(song => {
        song.onclick = function () {
            changeTo(this.getAttribute("song-id"));
        };
    });
    $(".js-btn-forward").onclick = () =>
        changeTo(++currentSong >= listSongsLength ? 0 : currentSong);
    $(".js-btn-backward").onclick = () =>
        changeTo(--currentSong < 0 ? ++currentSong : currentSong);
}
export function request(api, method = "GET", raw) {
    let myBody = JSON.stringify(raw);
    let myHeaders = {
        "Content-Type": "application/json",
    };
    let requestOptions = {
        method: method,
        headers: myHeaders,
        body: myBody ?? null,
    };
    return fetch(api, requestOptions).then(response => response.json());
}
function changeTo(songId) {
    let songApi = songsApi + "/" + songId;
    $(".js-audio").pause();
    $(".player-banner").style.animation = "none";
    $(".player-banner").classList.remove("active");
    $(".js-btn-pause-play").classList.remove("active");
    $(".js-audio").currentTime = 0;
    currentSong = songId;
    return request(songApi)
        .then(songItem => {
            let songBannerUrl = songItem["banner-url"];
            let songUrl = songItem.url;
            $(".player-banner").outerHTML = `
                <div class="player-banner js-banner">
                    <div
                        class="player-banner-bg"
                        style="
                            background: url(${songBannerUrl})
                                no-repeat;
                            background-position: center;
                            background-size: cover;
                        "
                    ></div>
                </div>
            `;
            $(".js-audio").outerHTML = `
                <audio class="js-audio">
                    <source
                        src="${songUrl}"
                    />
                </audio>
            `;
            $(".player-music-name").innerText = songItem.name;
        })
        .then(() => {
            let bannerElement = $(".js-banner");
            let defaultWidth = bannerElement.offsetWidth;
            let scrollTop = document.documentElement.scrollTop;
            let newWidth = defaultWidth - scrollTop;
            newWidth = newWidth < 0 ? 0 : newWidth;
            bannerElement.style.width = newWidth + "px";
        })
        .then(handleSeekBar)
        .then(autoForward)
        .then(() => {
            if ($(".js-btn-repeat").classList.contains("active")) {
                $(".js-audio").setAttribute("loop", "true");
            }
            if ($(".js-btn-random").classList.contains("active")) {
                $(".js-audio").addEventListener("ended", toRandom);
            }
        })
        .then(() => {
            $(".js-audio").volume = 0.05;
        })
        .then(autoPlay)
        .then(handleBannerMinimize)
        .catch(error => console.log(error, "Loi khi thay doi bai hat!"));
}
function play() {
    $(".js-audio").play();
    $(".player-banner").classList.add("active");
    $(".js-btn-pause-play").classList.add("active");
}
function pause() {
    $(".js-audio").pause();
    $(".player-banner").classList.remove("active");
    $(".js-btn-pause-play").classList.remove("active");
}
function autoForward() {
    $(".js-audio").addEventListener("ended", toForward);
}
function toForward() {
    changeTo(++currentSong >= listSongsLength ? 0 : currentSong);
}
function autoPlay(ms = 500) {
    setTimeout(play, ms);
}
function toRandom() {
    let a;
    do {
        a = Math.floor(Math.random() * 10);
    } while (a >= listSongsLength || a == currentSong);
    changeTo(a);
}
function handleBannerMinimize() {
    let bannerElement = $(".js-banner");
    let defaultWidth = bannerElement.offsetWidth;
    document.onscroll = () => {
        let scrollTop = document.documentElement.scrollTop;
        let newWidth = defaultWidth - scrollTop;
        newWidth = newWidth < 0 ? 0 : newWidth;
        bannerElement.style.width = newWidth + "px";
        console.log(scrollTop, newWidth);
    };
}
