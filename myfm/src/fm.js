    var listBtn = $(".musicbox .list");
    var playBtn = $(".music-control .play");
    var nextBtn = $(".music-control .next");
    var preBtn = $(".music-control .pre");
    var musicList = $('.musicbox .musicstyle');
    var title = $(".title");
    var author = $(".author");
    var lrc = $(".lyrics");
    var picture = $(".theme img");
    var progress = $(".progress");//音乐长度
    var nowProgress = $(".progress-now");//目前音乐进度
    var voiceBtn = $(".voice");
    var voiceBox = $(".voice-box");
    var voiceProgress = $(".voice-progress");//音量进度条
    var nowVoiceProgress = $(".voice-progress-now");
    var music = new Audio();
    var timeNode = $(".time");
    music.autoplay = false;//不自动播放
    var playStauts = true; //播放状态
    var nowChannelId;//当前频道id
    var timer;//音乐进度条定时
    var btnLock = true;//设置音乐按钮锁
    var lrcUrl;//歌词对应地址,
    var preSongData, nextSongData, nowSongData;
    getMusicList();//获取专辑列表

    listBtn.on("click", function (e) {//控制音乐列表
      musicList.toggleClass('show');
      e.stopPropagation();
    })
    musicList.on("click", 'li', function (e) {//选定歌曲风格
      $(e.target).siblings().removeClass("selected");
      $(e.target).addClass("selected");
      var channelId = $(e.target).attr('data-id');
      nowChannelId = channelId;
      e.stopPropagation();
      $('.lrc-list').empty();
      getMusic(channelId);
      playSong();
    })
    $(document).on("click", function () {
      musicList.removeClass('show');//点击区域外关闭音乐列表
      voiceBox.removeClass('show');
    })
    playBtn.on("click", function () {
      if (playStauts) {
        pauseSong();
      } else {
        playSong();
      }
    })
    nextBtn.on("click", function () {
      if (!btnLock) {
        return;
      }
      btnLock = false;
      $('.lrc-list').empty();//清空歌词
      console.log(nextSongData);
      if (nextSongData) {
        preSongData = nowSongData;
        setMusic(nextSongData);
        playSong();
        nextSongData = undefined;
      } else {
        preSongData = nowSongData;
        getMusic(nowChannelId);
        playSong();
      }
    })
    preBtn.on("click", function () {
      if (!btnLock) {
        return;
      }
      btnLock = false;
      $('.lrc-list').empty();
      if (preSongData) {
        nextSongData = nowSongData;
        setMusic(preSongData);
        playSong();
        preSongData = undefined;
      } else {
        nextSongData = nowSongData;
        getMusic(nowChannelId);
        playSong();

      }
    })
    progress.on("click", function (e) {
      if ($(e.target).hasClass("time")) {//避免点击播放时间会造成进度跳动
        return;
      }
      var percent = e.offsetX / parseInt(getComputedStyle(this).width)
      music.currentTime = percent * music.duration//设置播放时间
      nowProgress.width(percent * 100 + "%");
    })
    voiceBox.on("click", function (e) {//点击音量盒子不会消失
      e.stopPropagation();
    })
    voiceBtn.on("click", function (e) {
      voiceBox.toggleClass('show');
      e.stopPropagation();
    })
    voiceProgress.on("click", function (e) {
      var percent = e.offsetX / parseInt(getComputedStyle(this).width);
      nowVoiceProgress.width(percent * 100 + "%");
      music.volume = percent;
      e.stopPropagation();
    })
    music.onplaying = function () {//播放状态下
      timer = setInterval(function () {
        updateProgress()
      }, 1000)
    }
    music.onpause = function () {//暂停状态下
      clearInterval(timer)
    }
    music.onended = function () {//歌曲结束后重新获取新歌曲
      $('.lrc-list').empty();
      getMusic(nowChannelId);
      playSong();
      preSongData = nowSongData;
    }

    function getMusicList() {
      $.ajax({
        type: "GET",
        url: "https://jirenguapi.applinzi.com/fm/getChannels.php",
      }).done(function (list) {
        var li = renderListData(JSON.parse(list));//转换为json格式数据
        $(".style").html(li);
        $(".style li").eq(0).addClass("selected");
        nowChannelId = $(".style li").eq(0).attr("data-id");
        getMusic(nowChannelId);
        playSong();
      });

    }
    function renderListData(data) {
      var content = '';
      for (var i = 0; i < data.channels.length; i++) {
        content += "<li data-id='" + data.channels[i].channel_id + "'>" + data.channels[i].name + "</li>";
      }
      return $(content);
    }
    function getMusic(id) {
      $.ajax({
        type: "GET",
        url: "https://jirenguapi.applinzi.com/fm/getSong.php",
        data: {
          channel: id
        }
      }).done(function (ret) {
        renderSongData(JSON.parse(ret));
        getLrc(lrcUrl);
      });
    }
    function setMusic(songData) {//回滚上一首或下一首歌曲
      title.text(songData.title);
      author.text(songData.author);
      picture.attr("src", songData.picture);
      play(songData.url);
      getLrc(songData.sid);
      nowSongData = {
        title:songData.title,
        author:songData.author,
        picture:songData.picture,
        url:songData.url,
        sid:songData.sid
      }
    }
    function renderSongData(data) {
      var newtitle = data.song[0].title;
      var newpicture = data.song[0].picture;
      var newauthor = data.song[0].artist;
      var newurl = data.song[0].url;
      var newsid = lrcUrl = data.song[0].sid;
      nowSongData = {
        title: newtitle,
        picture: newpicture,
        author: newauthor,
        url: newurl,
        sid: newsid
      }
      title.text(newtitle);
      author.text(newauthor);
      picture.attr("src", newpicture);
      play(newurl);
    }
    function play(url) {
      music.src = url;
      music.play();
    }
    function playSong() {
      playBtn.removeClass("play");
      playBtn.addClass("pause");
      music.play();
      playStauts = true;
    }
    function pauseSong() {
      playBtn.removeClass("pause");
      playBtn.addClass("play");
      music.pause();
      playStauts = false;
    }
    function updateProgress() {//更新播放时间
      var percent = (music.currentTime / music.duration) * 100 + '%'
      nowProgress.width(percent);
      var minutes = parseInt(music.currentTime / 60)
      var seconds = parseInt(music.currentTime % 60) + ''
      seconds = seconds.length == 2 ? seconds : '0' + seconds
      timeNode.text(minutes + ':' + seconds);
    }
    function getLrc(lrcUrl) {
      $.ajax({
        type: "GET",
        url: 'https://jirenguapi.applinzi.com/fm/getLyric.php',
        data: {
          sid: lrcUrl
        }
      }).done(function (ret) {
        renderLrcData(JSON.parse(ret).lyric);
        btnLock = true;
      });
    }
    function renderLrcData(text) {
      var lines = text.split('\n');//将文本分隔成一行一行，存入数组   
      var pattern = /\[\d{2}:\d{2}.\d{2}\]/;////用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]    
      var result = [];//保存最终结果的数组
      var newLines = [];
      for (var i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          newLines.push(lines[i]);
        }
      }//对歌词进行过滤   
      newLines.shift();
      newLines.forEach(function (v /*数组元素值*/, i /*元素索引*/, a /*数组本身*/) {
        var time = v.match(pattern);  //提取出时间[xx:xx.xx]  
        var value = v.replace(pattern, '');  //提取歌词   

        //因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔    
        time.forEach(function (v1, i1, a1) {
          //去掉时间里的中括号得到xx:xx.xx    
          var t = v1.slice(1, -1).split(':');
          //将结果压入最终数组    
          result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
        });
      });
      //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词    
      result.sort(function (a, b) {
        return a[0] - b[0];
      });
      showLrcData(result);//展示歌词
    }
    function showLrcData(arr) {
      for (var i = 0, li; i < arr.length; i++) {
        li = $('<li>' + arr[i][1] + '</li>');
        $('.lrc-list').append(li);
        $('.lrc-list li').hide();
      }
      music.ontimeupdate = function () {//视屏 音频当前的播放位置发生改变时触发    
        for (var i = 0, l = arr.length; i < l; i++) {
          if (this.currentTime /*当前播放的时间*/ > arr[i][0]) { //显示到页面    
            $('.lrc-list li').hide();
            $('.lrc-list li').eq(i).show()
            $('.lrc-list li').eq(i + 1).show()
            $('.lrc-list li').eq(i + 2).show()
            $('.lrc-list li').css('color', '#000');
            $('.lrc-list li:nth-child(' + (i + 1) + ')').css('color', 'red'); //高亮显示当前播放的哪一句歌词    
          }
        }
      }
    }