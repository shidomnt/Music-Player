/**
 * Render List Songs - OK
 * Render (First) Song - OK
 * Player Shrink - OK
 * Banner Rotate - OK
 * Play - Pause - SeekBar - OK
 * Backward - ForWard - OK
 * Random - OK
 * Repeat - Next when ended song - OK
 * Play song when click - OK
 * Local Storage Config - OK
 */
const songsApi = "http://192.168.1.152:3000/songs";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const audio = $(".js-audio");
const AUDIO_PLAYER_KEY = "MYKEY";
const app = {
    config: JSON.parse(window.localStorage.getItem(AUDIO_PLAYER_KEY)) || {},
    volume: 0.1,
    currentId: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    playedSongs: [],
    setConfig(key, value) {
        this.config[key] = value;
    },
    updateConfig() {
        app.setConfig("isRepeat", app.isRepeat);
        app.setConfig("isRandom", app.isRandom);
        app.setConfig("currentId", app.currentId);
        app.setConfig("volume", app.volume);
        window.localStorage.setItem(
            AUDIO_PLAYER_KEY,
            JSON.stringify(this.config)
        );
        console.log(this.config);
    },
    loadConfig() {
        this.isRandom = this.config.isRandom || false;
        this.isRepeat = this.config.isRepeat || false;
        this.currentId = this.config.currentId || 0;
        this.volume = this.config.volume || 0.1;
    },
    clearPlayedSongs() {
        this.playedSongs.splice(0);
    },
    addPlayedSongs(songId) {
        this.playedSongs.push(songId);
    },
    defineProperties() {
        Object.defineProperty(this, "currentSong", {
            get() {
                return this.songs[this.currentId];
            },
        });
    },
    renderPlayer() {
        const html = `
                <div class="btn btn-repeat ${
                    this.isRepeat ? "active" : ""
                } js-btn-repeat">
                    <i class="btn-icon fas fa-redo"></i>
                </div>
                <div class="btn btn-backward js-btn-backward">
                    <i class="btn-icon fas fa-step-backward"></i>
                </div>
                <div class="btn btn-toggle-play js-btn-toggle-play">
                    <i class="btn-icon btn-pause fas fa-pause"></i>
                    <i class="btn-icon btn-play fas fa-play"></i>
                </div>
                <div class="btn btn-forward js-btn-forward">
                    <i class="btn-icon fas fa-step-forward"></i>
                </div>
                <div class="btn btn-random ${
                    this.isRandom ? "active" : ""
                } js-btn-random">
                    <i class="btn-icon fas fa-random"></i>
                </div>
                <input
                    type="range"
                    class="progress js-seekBar"
                    min="0"
                    value="0"
                    step="0.1"
                />
            `;
        $(".player-controls").innerHTML = html;
    },
    render() {
        const htmls = this.songs
            .map(song => {
                const html = `
                <div class="song ${
                    song.id === this.currentId ? "active" : ""
                }" song-id="${song.id}">
                    <div class="song-banner-container">
                        <div class="song-banner">
                            <div
                                class="song-banner-bg"
                                style="
                                    background: url(${song.image})
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
                    <div class="song-options">
                        <i class="song-options-icon fas fa-ellipsis-h"></i>
                        <div class="option-list">
                            <div><a class="option" href="${
                                song.url
                            }" download target="_blank">Tải bài hát</a></div>
                            <div class="option"><a href="">Thêm thông tin</a></div>
                        </div>
                    </div>
                </div>
            `;
                return html;
            })
            .join("");
        $(".songs-container").innerHTML = htmls;
    },
    renderCurrentSong() {
        const song = this.currentSong;
        $(".player-music-name").innerText = song.name;
        $(".player-banner-bg").style.backgroundImage = `url('${song.image}')`;
        audio.src = song.url;
    },
    forwardSong() {
        this.currentId++;
        if (this.currentId >= this.songs.length) this.currentId = 0;
        this.renderCurrentSong();
    },
    backwardSong() {
        this.currentId--;
        if (this.currentId < 0) this.currentId = this.songs.length - 1;
        this.renderCurrentSong();
    },
    playRandom() {
        this.addPlayedSongs(this.currentId);
        if (this.playedSongs.length == this.songs.length) {
            this.clearPlayedSongs();
        }
        let newId;
        do {
            newId = Math.floor(Math.random() * this.songs.length);
        } while (this.playedSongs.indexOf(newId) != -1);
        this.currentId = newId;
        this.renderCurrentSong();
    },
    playRepeat() {
        // this.renderCurrentSong();
        audio.load();
    },

    autoPlay(ms = 500) {
        setTimeout(() => {
            audio.play();
        }, ms);
    },
    scrollToActiveSong() {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "center",
            });
        }, 500);
    },
    handleEvent() {
        const banner = $(".js-banner");
        const defaultWidth = banner.offsetWidth;
        const playBtn = $(".btn-toggle-play");
        const backwardBtn = $(".js-btn-backward");
        const forwardBtn = $(".js-btn-forward");
        const seekBar = $(".js-seekBar");
        const repeatBtn = $(".js-btn-repeat");
        const randomBtn = $(".js-btn-random");
        const songsContainer = $(".js-songs-container");
        document.onclick = () => {
            app.updateConfig();
        };
        //Banner Rotate
        let rotate = banner.animate(
            [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }],
            { duration: 60000, iterations: Infinity, easing: "linear" }
        );
        rotate.pause();
        // Handle Scroll Shrink
        document.onscroll = () => {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newWidth = defaultWidth - scrollTop;
            banner.style.width = newWidth < 0 ? 0 : newWidth + "px";
            banner.style.opacity = newWidth / defaultWidth;
        };
        // Handle Play - Pause
        playBtn.onclick = () => {
            if (this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };
        audio.onplay = () => {
            playBtn.classList.add("active");
            this.isPlaying = true;
            rotate.play();
        };
        audio.onpause = () => {
            playBtn.classList.remove("active");
            this.isPlaying = false;
            rotate.pause();
        };
        // Handle SeekBar
        audio.onloadedmetadata = () => {
            seekBar.max = audio.duration;
        };
        audio.ontimeupdate = () => {
            // let seekBarPercent = (audio.currentTime / audio.duration) * 100;
            // seekBar.value = seekBarPercent;
            seekBar.value = audio.currentTime;
        };
        seekBar.onchange = () => {
            // let currentTime = (seekBar.value / 100) * audio.duration;
            // audio.currentTime = currentTime;
            audio.currentTime = seekBar.value;
        };
        forwardBtn.onclick = () => {
            if (this.isRandom) {
                this.playRandom();
            } else {
                this.forwardSong();
            }
            this.render();
            this.scrollToActiveSong();
            this.autoPlay();
            rotate.cancel();
        };
        backwardBtn.onclick = () => {
            if (this.isRandom) {
                this.playRandom();
            } else {
                this.backwardSong();
            }
            this.render();
            this.scrollToActiveSong();
            this.autoPlay();
            rotate.cancel();
        };
        randomBtn.onclick = function () {
            app.isRandom = !app.isRandom;
            this.classList.toggle("active", app.isRandom);
            if (app.isRepeat) {
                app.isRepeat = false;
                repeatBtn.classList.remove("active");
            }
        };
        repeatBtn.onclick = function () {
            app.isRepeat = !app.isRepeat;
            this.classList.toggle("active", app.isRepeat);
            if (app.isRandom) {
                app.isRandom = false;
                randomBtn.classList.remove("active");
            }
        };
        audio.onended = () => {
            if (this.isRandom) {
                this.playRandom();
            } else if (this.isRepeat) {
                this.playRepeat();
            } else {
                this.forwardSong();
            }
            this.render();
            this.scrollToActiveSong();
            this.autoPlay(0);
        };
        songsContainer.onclick = event => {
            let optionsBtn = event.target.closest(".song-options");
            let songBtn = event.target.closest(".song:not(.active)");

            if (optionsBtn) {
                $(".overlay").style.display = "unset";
                optionsBtn.querySelector(".option-list").style.display =
                    "unset";
                $(".overlay").onclick = function () {
                    $(".overlay").style.display = "none";
                    optionsBtn.querySelector(".option-list").style.display =
                        "none";
                };
            } else if (songBtn) {
                this.currentId = Number(songBtn.getAttribute("song-id"));
                this.renderCurrentSong();
                this.render();
                this.autoPlay(0);
            }
        };
    },
    setVolume() {
        audio.volume = this.volume;
    },
    start(songsList) {
        this.loadConfig();

        Object.defineProperty(this, "songs", {
            value: songsList,
        });

        this.defineProperties();

        this.render();

        this.renderPlayer();

        this.setVolume();

        this.scrollToActiveSong();

        this.renderCurrentSong();

        this.handleEvent();
    },
};
fetch(songsApi)
    .then(response => response.json())
    .then(songsList => app.start(songsList))
    .catch(error => console.log("Cannot GET List Songs: ", error));
