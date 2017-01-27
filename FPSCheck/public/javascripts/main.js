//var socket = io.connect('https://safe-reef-35714.herokuapp.com/');
//var socket = io.connect('ws://192.168.11.250:5555');
//var socket = io.connect('ws://localhost:5555');

var myPlayerID = 0;

//socket.on("connect", function () {
//    var id = socket.io.engine.id;
//    console.log("Connected ID: " + id);
//});



enchant();

window.onload = function ()
{
    var core = new Core(1280, 720);

    //悪魔               Type     Dir  Level ID   BASECOST COST  HP  ATK  SPEED    
    var PUPU = new Demon("PUPU", "None", 0, null, 100,     100, 150, 250, 3);
    var POPO = new Demon("POPO", "None", 0, null, 100,     100, 1000, 100, 2);
    var PIPI = new Demon("PIPI", "None", 0, null, 100,     100, 100, 50, 5);

    //自分の初期所持コスト
    var haveCost = 500;

    //最大所持コスト
    var MaxCost = 3000;

    //毎秒取得できるコスト
    var fpsCost = 25;

    //最大ステータス
    var MAXHP = 7000;
    var MAXATK = 1700;
    var MAXSPEED = 5;

    //タッチし始めの場所を確認
    var tapPos = new TapPos();
    //なにをタップしたかの確認
    var tapObj;
    //コストが払えるかのフラグ
    var Flag;
    //タイマー
    var Timer;

    //必殺技を撃ったかのフラグ
    var deadlyFlag;
    //必殺技コスト数
    var deadlyCost = 10;
    //パワーアップのコストが増える間隔
    var powerUpInterval = 5;

    //10個までの魂保管用配列
    var spiritsLength = 10;
    var Spirits = new Array(spiritsLength);
    for (var i = 0; i < spiritsLength; i++)
    {
        Spirits[i] = null;
    }
    //魂をふよふよさせるために必要な変数
    var degree = 0;

    //キー割り当て(デバッグ用)
    core.keybind(' '.charCodeAt(0), 'summonSpirit');
    core.keybind('a'.charCodeAt(0), 'Main');
    core.keybind('s'.charCodeAt(0), 'Result');
    core.keybind('d'.charCodeAt(0), 'Matching');
    core.keybind('p'.charCodeAt(0), 'Pause');

    //押した時に一回だけ呼ばれるようにするためのフラグ
    var oneCallFlag = false;
    var buttonUpFlag = false;

    var stoppingFlag = false;

    var label = new Label();
    label.moveTo(10, 50);
    label.font = "italic 36px 'ＭＳ 明朝', 'ＭＳ ゴシック', 'Times New Roman', serif, sans-serif";

    //事前にロードを行う
    //背景
    core.preload('img/back5.png');
    core.preload('matchingUI/sumahoTitle.png');
    core.preload('matchingUI/sumatai_haikei.png');
    core.preload('matchingUI/otu.png');

    //ボタン
    core.preload('img/pupu.png');
    core.preload('img/pipi.png');
    core.preload('img/popo.png');
    core.preload('img/pupu2.png');
    core.preload('img/pipi2.png');
    core.preload('img/popo2.png');
    core.preload('img/ya_blue.png');
    core.preload('img/ya_green.png');
    core.preload('img/ya_red.png');
    core.preload('img/deadly.png');
    core.preload('img/deadly2.png');
    core.preload('img/deadly3.png');

    //UI・フォント
    core.preload('img/CP.png');
    core.preload('img/rednumber_siro.png');
    core.preload('img/blacknumber.png');
    core.preload('img/huki_blue.png');
    core.preload('img/huki_green.png');
    core.preload('img/huki_red.png');
    core.preload('img/kama_soul.png');
    core.preload('matchingUI/game_end_tap.png');
    core.preload('matchingUI/tap_the_screen.png');
    core.preload('matchingUI/title.png');
    core.preload('matchingUI/teamb.png');
    core.preload('matchingUI/teamr.png');
    core.preload('matchingUI/matching.png');
    core.preload('matchingUI/setumei.png');
    core.preload('matchingUI/setumei2.png');
    core.preload('matchingUI/setumei3.png');
    core.preload('matchingUI/setumei4.png');
    core.preload('matchingUI/setumei5.png');
    core.preload('matchingUI/setumei6.png');
    core.preload('matchingUI/setumei7.png');
    core.preload('matchingUI/setumei8.png');
    core.preload('img/matome_red.png');
    core.preload('img/matome_blue.png');
    core.preload('img/matome_green.png');
    core.preload('matchingUI/see_mo.png');

    //スピリット
    core.preload('img/pupu_soul.png');
    core.preload('img/popo_soul.png');
    core.preload('img/pipi_soul.png');

    //gif
    core.preload('img/sumahotatti.png');

    //fpsの設定
    core.fps = 24;

    core.onload = function ()
    {
//////////////////////////タイトルシーン//////////////////////////////////////////////////////////////////////////////
        var TitleScene = function ()
        {
            var scene = new Scene();
            
            ////////画像情報処理////////
            //背景
            var titleBack = new Sprite(1280, 720);
            titleBack.image = core.assets['matchingUI/sumahoTitle.png'];
            titleBack.scale(2.5, 2.5);
            titleBack.x = 960;
            titleBack.y = 480;

            var title = new Sprite(960, 560);
            title.image = core.assets['matchingUI/title.png'];
            title.scale(1.5, 1.5);
            title.x = 1120;
            title.y = 200;

            var tapRequest = new Sprite(1024, 256);
            tapRequest.image = core.assets['matchingUI/tap_the_screen.png'];
            tapRequest.x = 1088;
            tapRequest.y = 1200;

            var PUPUgif = new Sprite(600, 600);
            PUPUgif.image = core.assets['img/sumahotatti.png'];
            PUPUgif.x = 2400;
            PUPUgif.y = 1200;
            PUPUgif.frame = 0;

            scene.addEventListener('enterframe', function ()
            {
                var radian = Math.PI / 180 * degree;
                tapRequest.y += Math.sin(radian);
                degree += 3;
                PUPUgif.frame = PUPUgif.age % 24;
            });

            ////////メイン処理////////
            scene.addEventListener(Event.TOUCH_START, function ()
            {
                //現在表示しているシーンをゲームシーンに置き換えます
                //core.replaceScene(MainScene());
                core.replaceScene(MainScene());
            });

            label.addEventListener("enterframe", function () {
                label.text = core.actualFps;
            });

            ////////描画////////
            scene.addChild(titleBack);
            scene.addChild(title);
            scene.addChild(tapRequest);
            scene.addChild(PUPUgif);
            scene.addChild(label);

            return scene;
        };

//////////////////////////マッチングシーン//////////////////////////////////////////////////////////////////////////////
        var MatchingScene = function ()
        {
            var scene = new Scene();

            //socket.emit("EnterRobby");

            ////プレイヤーIDのセット
            //socket.on("PushPlayerID", function (idData) {
            //    myPlayerID = idData.PlayerID;
            //    console.log("Connect PlayerID: " + myPlayerID);
            //});

            var back = new Sprite(1280, 720);
            back.image = core.assets['matchingUI/sumatai_haikei.png'];
            back.scale(2.5, 2.5);
            back.x = 960;
            back.y = 480;

            var teamColor = new Sprite(1024, 256);            
            teamColor.x = 2000;
            teamColor.y = 100;

            scene.addEventListener('enterframe', function ()
            {
                if (myPlayerID / 2 == 0) {
                    teamColor.image = core.assets['matchingUI/teamr.png'];
                }
                else {
                    teamColor.image = core.assets['matchingUI/teamb.png'];
                }
            });

            //socket.on("PushMatchingEnd", function () {
            //    //現在表示しているシーンをゲームシーンに置き換えます
            //    core.replaceScene(MainScene());
            //});

            scene.addChild(back);
            scene.addChild(teamColor);

            return scene;
        };

//////////////////////////メインシーン//////////////////////////////////////////////////////////////////////////////
        var MainScene = function ()
        {
            var scene = new Scene();

            //フレームリセット
            core.frame = 0;

            ////////画像情報処理////////
            {
                //ププのボタン
                var pupuBtn = new Sprite(1200, 1200);
                pupuBtn.image = core.assets['img/pupu.png'];
                pupuBtn.scale(0.25, 0.25);
                pupuBtn.x = 2200;
                pupuBtn.y = -300;

                //ポポのボタン
                var popoBtn = new Sprite(1200, 1200);
                popoBtn.image = core.assets['img/popo.png'];
                popoBtn.scale(0.25, 0.25);
                popoBtn.x = 2200;
                popoBtn.y = 300;

                //ピピのボタン
                var pipiBtn = new Sprite(1200, 1200);
                pipiBtn.image = core.assets['img/pipi.png'];
                pipiBtn.scale(0.25, 0.25);
                pipiBtn.x = 2200;
                pipiBtn.y = 900;

                //必殺技のボタン
                var deadlyBtn = new Sprite(239, 140);
                deadlyBtn.image = core.assets['img/deadly.png'];
                deadlyBtn.scale(3, 3);
                deadlyBtn.x = 800;
                deadlyBtn.y = 140;

                //背景
                var back = new Sprite(3200, 1800);
                back.image = core.assets['img/back5.png'];
                back.x = 0;
                back.y = 0;

                //UI
                //ププのUI背景
                var PUPU_UI = new Sprite(600, 600);
                PUPU_UI.image = core.assets['img/huki_red.png'];
                PUPU_UI.scale(1.5, 1.2);
                PUPU_UI.x = 1900;
                PUPU_UI.y = 0;

                //ポポのUI背景
                var POPO_UI = new Sprite(600, 600);
                POPO_UI.image = core.assets['img/huki_green.png'];
                POPO_UI.scale(1.5, 1.2);
                POPO_UI.x = 1900;
                POPO_UI.y = 600;

                //ピピのUI背景
                var PIPI_UI = new Sprite(600, 600);
                PIPI_UI.image = core.assets['img/huki_blue.png'];
                PIPI_UI.scale(1.5, 1.2);
                PIPI_UI.x = 1900;
                PIPI_UI.y = 1200;

                //ポンプ本体
                var ponpu = new Sprite(600, 400);
                ponpu.image = core.assets['img/kama_soul.png'];
                ponpu.scale(2, 2);
                ponpu.x = 600;
                ponpu.y = 900;

                //矢印
                var Arrow = new Sprite(600, 600);
                Arrow.image = core.assets['img/ya_blue.png'];
                Arrow.scale(0.5, 0.5);
                Arrow.x = 5000;
                Arrow.y = -5000;

                //CPのフォント
                var CPFont = new Sprite(150, 150);
                CPFont.image = core.assets['img/CP.png'];
                CPFont.scale(1, 1);
                CPFont.x = 1300;
                CPFont.y = 1600;

                //所持コストのフォント
                var costFont = new Array();
                var costDigit = 4;  //桁数(初期設定4桁)
                for (var i = 0; i < costDigit; i++) {
                    costFont[i] = new Sprite(120, 120);
                    costFont[i].image = core.assets['img/rednumber_siro.png'];
                    costFont[i].scale(4, 4);
                    costFont[i].x = 1300 - (i + 1) * 150;
                    costFont[i].y = 1600;
                    costFont[i].frame = 0;
                }

                //デーモンに必要なコストのフォント
                var DemoncostDigit = 3;  //桁数(初期設定3桁)

                var PUPUcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    PUPUcostFont[i] = new Sprite(120, 120);
                    PUPUcostFont[i].image = core.assets['img/blacknumber.png'];
                    PUPUcostFont[i].scale(2, 2);
                    PUPUcostFont[i].x = 2400 - (i + 1) * 100;
                    PUPUcostFont[i].y = 100;
                    PUPUcostFont[i].frame = 0;
                }

                var POPOcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    POPOcostFont[i] = new Sprite(120, 120);
                    POPOcostFont[i].image = core.assets['img/blacknumber.png'];
                    POPOcostFont[i].scale(2, 2);
                    POPOcostFont[i].x = 2400 - (i + 1) * 100;
                    POPOcostFont[i].y = 700;
                    POPOcostFont[i].frame = 0;
                }

                var PIPIcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    PIPIcostFont[i] = new Sprite(120, 120);
                    PIPIcostFont[i].image = core.assets['img/blacknumber.png'];
                    PIPIcostFont[i].scale(2, 2);
                    PIPIcostFont[i].x = 2400 - (i + 1) * 100;
                    PIPIcostFont[i].y = 1300;
                    PIPIcostFont[i].frame = 0;
                }

                var strengthInterval = 3;

                ////////ステータスバー部分//////
                {
                    var PUPUHP = new Sprite(150, 600);
                    PUPUHP.image = core.assets['img/matome_green.png'];
                    PUPUHP.scale(0.5, 1);
                    PUPUHP.x = 1825;
                    PUPUHP.y = 250;
                    PUPUHP.originY = 0;
                    PUPUHP.rotate(-90);
                    PUPUHP.frame = 0;

                    var PUPUATK = new Sprite(150, 600);
                    PUPUATK.image = core.assets['img/matome_red.png'];
                    PUPUATK.scale(0.5, 1);
                    PUPUATK.x = 1825;
                    PUPUATK.y = 350;
                    PUPUATK.originY = 0;
                    PUPUATK.rotate(-90);
                    PUPUATK.frame = 0;

                    var PUPUSPEED = new Sprite(150, 600);
                    PUPUSPEED.image = core.assets['img/matome_blue.png'];
                    PUPUSPEED.scale(0.5, 1);
                    PUPUSPEED.x = 1825;
                    PUPUSPEED.y = 450;
                    PUPUSPEED.originY = 0;
                    PUPUSPEED.rotate(-90);
                    PUPUSPEED.frame = 0;

                    var POPOHP = new Sprite(150, 600);
                    POPOHP.image = core.assets['img/matome_green.png'];
                    POPOHP.scale(0.5, 1);
                    POPOHP.x = 1825;
                    POPOHP.y = 850;
                    POPOHP.originY = 0;
                    POPOHP.rotate(-90);
                    POPOHP.frame = 0;

                    var POPOATK = new Sprite(150, 600);
                    POPOATK.image = core.assets['img/matome_red.png'];
                    POPOATK.scale(0.5, 1);
                    POPOATK.x = 1825;
                    POPOATK.y = 950;
                    POPOATK.originY = 0;
                    POPOATK.rotate(-90);
                    POPOATK.frame = 0;

                    var POPOSPEED = new Sprite(150, 600);
                    POPOSPEED.image = core.assets['img/matome_blue.png'];
                    POPOSPEED.scale(0.5, 1);
                    POPOSPEED.x = 1825;
                    POPOSPEED.y = 1050;
                    POPOSPEED.originY = 0;
                    POPOSPEED.rotate(-90);
                    POPOSPEED.frame = 0;

                    var PIPIHP = new Sprite(150, 600);
                    PIPIHP.image = core.assets['img/matome_green.png'];
                    PIPIHP.scale(0.5, 1);
                    PIPIHP.x = 1825;
                    PIPIHP.y = 1450;
                    PIPIHP.originY = 0;
                    PIPIHP.rotate(-90);
                    PIPIHP.frame = 0;

                    var PIPIATK = new Sprite(150, 600);
                    PIPIATK.image = core.assets['img/matome_red.png'];
                    PIPIATK.scale(0.5, 1);
                    PIPIATK.x = 1825;
                    PIPIATK.y = 1550;
                    PIPIATK.originY = 0;
                    PIPIATK.rotate(-90);
                    PIPIATK.frame = 0;

                    var PIPISPEED = new Sprite(150, 600);
                    PIPISPEED.image = core.assets['img/matome_blue.png'];
                    PIPISPEED.scale(0.5, 1);
                    PIPISPEED.x = 1825;
                    PIPISPEED.y = 1650;
                    PIPISPEED.originY = 0;
                    PIPISPEED.rotate(-90);
                    PIPISPEED.frame = 0;
                }
            }
            ////////メイン処理////////

            ////秒間コストを受け取り
            //socket.on("PushSecondCost", function (CostData) {
            //    console.log(CostData.Cost);
            //    if (haveCost < MaxCost)
            //    {
            //        haveCost += CostData.Cost;
            //    }
            //    else
            //    {
            //        haveCost = MaxCost;
            //    }
            //});

            ////倒す・倒された時のコストを受け取り
            //socket.on("PushAddCost", function (CostData) {
            //    var _PlyaerID = parseInt(CostData.PlayerID.toString());
            //    if (_PlyaerID == myPlayerID)
            //        haveCost += CostData.Cost;
            //});

            ////ポーズ画面へ移動
            //socket.on("PushStopRequest", function ()
            //{
            //    if (!stoppingFlag)
            //    {
            //        stoppingFlag = true;
            //        core.pushScene(PauseScene());
            //    }                    
            //});

            ////ゲーム終了を受け取ってリザルト画面へ移行
            //socket.on("PushGameEndRequest", function ()
            //{
            //    core.replaceScene(ResultScene());
            //});

            label.addEventListener("enterframe", function () {
                label.text = core.actualFps;
            });

            //フレームごとに処理する
            core.addEventListener('enterframe', function ()
            {
                //CPフォント
                for (var i = costDigit - 1; i >= 0; i--) {
                    FontSet(haveCost, i, costFont[i]);
                }

                for (var i = DemoncostDigit - 1; i >= 0; i--) {
                    FontSet(PUPU.Cost, i, PUPUcostFont[i]);
                    FontSet(POPO.Cost, i, POPOcostFont[i]);
                    FontSet(PIPI.Cost, i, PIPIcostFont[i]);
                }

                //スペースボタンを押すと魂が取得できるように
                core.addEventListener('summonSpiritbuttondown', function () {
                    oneCallFlag = true;
                });

                //ポーズボタン
                if (!core.input.up)
                {
                    buttonUpFlag = true;
                }

                if(core.input.up && buttonUpFlag)
                {
                    buttonUpFlag = false;
                    //socket.emit("StopRequest");                 
                }

                core.addEventListener('summonSpiritbuttonup', function () {
                    if (oneCallFlag) {
                        //socket.emit("SpiritPush", { Type: "PUPU", PlayerID: myPlayerID });
                        oneCallFlag = false;
                    }
                });

                for (var i = 0; i < spiritsLength; i++) {
                    if (Spirits[i] != null) 
                    {
                        var radian = Math.PI / 180 * degree;
                        Spirits[i].Sprite.y += Math.sin(radian);
                    }
                }

                //スケールの設定を毎フレーム確認(成長度合いをスケールで調整)
                PUPUHP.scaleY = PUPU.HP * Math.pow(1.1, PUPU.Level) / MAXHP;
                PUPUATK.scaleY = PUPU.ATK * Math.pow(1.1, PUPU.Level) / MAXATK;
                PUPUSPEED.scaleY = PUPU.SPEED / MAXSPEED;
                POPOHP.scaleY = POPO.HP * Math.pow(1.1, POPO.Level) / MAXHP;
                POPOATK.scaleY = POPO.ATK * Math.pow(1.1, POPO.Level) / MAXATK;
                POPOSPEED.scaleY = POPO.SPEED / MAXSPEED;
                PIPIHP.scaleY = PIPI.HP * Math.pow(1.1, PIPI.Level) / MAXHP;
                PIPIATK.scaleY = PIPI.ATK * Math.pow(1.1, PIPI.Level) / MAXATK;
                PIPISPEED.scaleY = PIPI.SPEED / MAXSPEED;

                PUPUHP.frame = PUPUHP.age % 57;
                PUPUATK.frame = PUPUATK.age % 57;
                PUPUSPEED.frame = PUPUSPEED.age % 57;
                POPOHP.frame = POPOHP.age % 57;
                POPOATK.frame = POPOATK.age % 57;
                POPOSPEED.frame = POPOSPEED.age % 57;
                PIPIHP.frame = PIPIHP.age % 57;
                PIPIATK.frame = PIPIATK.age % 57;
                PIPISPEED.frame = PIPISPEED.age % 57;
                

                degree += 1.5;
            });

            //ボタンが押された時の処理
            pupuBtn.on(Event.TOUCH_START, function () {
                pupuBtn.image = core.assets['img/pupu2.png'];
                tapObj = "pupuBtn";
            });

            popoBtn.on(Event.TOUCH_START, function () {
                popoBtn.image = core.assets['img/popo2.png'];
                tapObj = "popoBtn";
            });

            pipiBtn.on(Event.TOUCH_START, function () {
                pipiBtn.image = core.assets['img/pipi2.png'];
                tapObj = "pipiBtn";
            });

            deadlyBtn.on(Event.TOUCH_START, function () {
                if (!deadlyFlag) {
                    deadlyBtn.image = core.assets['img/deadly2.png'];
                    tapObj = "deadlyBtn";
                }
            });

            //タップした場所の座標取得
            scene.on(Event.TOUCH_START, function (startPos) {
                tapPos.x = startPos.x;
                tapPos.y = startPos.y;
            });

            //離された時の処理
            pupuBtn.on(Event.TOUCH_END, function () {
                pupuBtn.image = core.assets['img/pupu.png'];
            });

            popoBtn.on(Event.TOUCH_END, function () {
                popoBtn.image = core.assets['img/popo.png'];
            });

            pipiBtn.on(Event.TOUCH_END, function () {
                console.log("call");
                pipiBtn.image = core.assets['img/pipi.png'];
            });

            deadlyBtn.on(Event.TOUCH_END, function () {
                if (!deadlyFlag) {
                    //必殺コスト分の魂があるか確認。
                    if (SpiritCheck(Spirits, deadlyCost, spiritsLength)) {
                        deadlyBtn.image = core.assets['img/deadly3.png'];
                        //ここで必殺情報をサーバーに送る
                        PushDeadly(myPlayerID);
                        //コストを最大に回復
                        haveCost = MaxCost;
                        //使用フラグを立てる
                        deadlyFlag = true;
                        //使用した魂の削除
                        Spirits = UsedSpirits(Spirits, deadlyCost, spiritsLength, scene);
                    }
                    else {
                        deadlyBtn.image = core.assets['img/deadly.png'];
                    }
                }
            });

            //タップした場所を使った処理はここから
            scene.on(Event.TOUCH_END, function (endPos) {
                //ププボタンの場所で押してた場合
                if (tapObj == "pupuBtn") {
                    if ((tapPos.y - endPos.y) > pupuBtn.height / 2 * pupuBtn.scaleY) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        haveCost = UseCost(haveCost, PUPU);
                        if (Flag == "Succes")
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.y - endPos.y) < -pupuBtn.height / 2 * pupuBtn.scaleY) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        haveCost = UseCost(haveCost, PUPU);
                        if (Flag == "Succes")
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.x - endPos.x) < -pupuBtn.height / 2 * pupuBtn.scaleX || (tapPos.x - endPos.x) > pupuBtn.height / 2 * pupuBtn.scaleX) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        haveCost = UseCost(haveCost, PUPU);
                        if (Flag == "Succes")
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                    }
                        //パワーアップを選択時
                    else {
                        if (SpiritCheck(Spirits, Math.floor(PUPU.Level / powerUpInterval + 1), spiritsLength)) {
                            PUPU.Level += 1;
                            PUPU.Cost = PUPU.BaseCost + PUPU.Level * 10;
                            //使用した魂の削除
                            Spirits = UsedSpirits(Spirits, Math.floor(PUPU.Level / powerUpInterval + 1), spiritsLength, scene);
                        }
                    }
                }
                    //ポポボタンの場所で押してた場合
                else if (tapObj == "popoBtn") {
                    if ((tapPos.y - endPos.y) > popoBtn.height / 2 * popoBtn.scaleY) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        haveCost = UseCost(haveCost, POPO);
                        if (Flag == "Succes")
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.y - endPos.y) < -popoBtn.height / 2 * popoBtn.scaleY) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        haveCost = UseCost(haveCost, POPO);
                        if (Flag == "Succes")
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.x - endPos.x) < -popoBtn.height / 2 * popoBtn.scaleX || (tapPos.x - endPos.x) > popoBtn.height / 2 * popoBtn.scaleX) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        haveCost = UseCost(haveCost, POPO);
                        if (Flag == "Succes")
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                    }
                        //パワーアップを選択時
                    else {
                        if (SpiritCheck(Spirits, Math.floor(POPO.Level / powerUpInterval + 1), spiritsLength)) {
                            POPO.Level += 1;
                            POPO.Cost = POPO.BaseCost + POPO.Level * 10;
                            //使用した魂の削除
                            Spirits = UsedSpirits(Spirits, Math.floor(POPO.Level / powerUpInterval + 1), spiritsLength, scene);
                        }
                    }
                }
                    //ピピボタンの場所で押してた場合
                else if (tapObj == "pipiBtn") {
                    if ((tapPos.y - endPos.y) > pipiBtn.height / 2 * pipiBtn.scaleY) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        haveCost = UseCost(haveCost, PIPI);
                        if (Flag == "Succes")
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.y - endPos.y) < -pipiBtn.height / 2 * pipiBtn.scaleY) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        haveCost = UseCost(haveCost, PIPI);
                        if (Flag == "Succes")
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.x - endPos.x) < -pipiBtn.height / 2 * pipiBtn.scaleX || (tapPos.x - endPos.x) > pipiBtn.height / 2 * pipiBtn.scaleX) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        haveCost = UseCost(haveCost, PIPI);
                        if (Flag == "Succes")
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                    }
                        //パワーアップを選択時
                    else {
                        if (SpiritCheck(Spirits, Math.floor(PIPI.Level / powerUpInterval + 1), spiritsLength)) {
                            PIPI.Level += 1;
                            PIPI.Cost = PIPI.BaseCost + PIPI.Level * 10;
                            //使用した魂の削除
                            Spirits = UsedSpirits(Spirits, Math.floor(PIPI.Level / powerUpInterval + 1), spiritsLength, scene);
                        }
                    }
                }

                tapObj = null;
            });

            ////////描画////////
            //オブジェクトに追加する処理(ここに入れたいオブジェクトを描画順に指定)
            /////////////背景/////////////
            scene.addChild(back);

            scene.addChild(pupuBtn);
            scene.addChild(popoBtn);
            scene.addChild(pipiBtn);
            scene.addChild(deadlyBtn);

            scene.addChild(ponpu);

            scene.addChild(PUPU_UI);
            scene.addChild(POPO_UI);
            scene.addChild(PIPI_UI);

            //矢印表示のためにここに処理
            scene.on(Event.TOUCH_MOVE, function (nowPos) {
                //ププボタンの場所で押してた場合
                if (tapObj == "pupuBtn") {
                    Arrow = ArrowSet(PUPU, pipiBtn, tapPos, nowPos, Arrow, core);
                    scene.addChild(Arrow);
                }
                    //ポポボタンの場所で押してた場合
                else if (tapObj == "popoBtn") {
                    Arrow = ArrowSet(POPO, pipiBtn, tapPos, nowPos, Arrow, core);
                    scene.addChild(Arrow);
                }
                    //ピピボタンの場所で押してた場合
                else if (tapObj == "pipiBtn") {
                    Arrow = ArrowSet(PIPI, pipiBtn, tapPos, nowPos, Arrow, core);
                    scene.addChild(Arrow);
                }
            });
            scene.on(Event.TOUCH_END, function () {
                Arrow.x = 9000;
                Arrow.y = -9000;
            });

            ////魂の受け取り&描画処理
            //socket.on("SpiritPushed", function (SpiritData) {
            //    var _PlayerID = parseInt(SpiritData.PlayerID.toString());

            //    if (_PlayerID == myPlayerID) {
            //        for (var i = 0; i < spiritsLength; i++) {
            //            if (Spirits[i] == null) {
            //                Spirits[i] = new Spirit(SpiritData.Type, SpiritData.PlayerID, core);
            //                scene.addChild(Spirits[i].Sprite);
            //                break;
            //            }
            //        }
            //    }
            //});

            //フォント
            scene.addChild(CPFont);

            //所持コストのフォント
            for (var i = 0; i < costDigit; i++) {
                scene.addChild(costFont[i]);
            }

            //悪魔の必要コストフォント
            for (var i = 0; i < DemoncostDigit; i++)
            {
                scene.addChild(PUPUcostFont[i]);
                scene.addChild(POPOcostFont[i]);
                scene.addChild(PIPIcostFont[i]);
            }

            //各悪魔のステータスバー
            scene.addChild(PUPUHP);
            scene.addChild(PUPUATK);
            scene.addChild(PUPUSPEED);
            scene.addChild(POPOHP);
            scene.addChild(POPOATK);
            scene.addChild(POPOSPEED);
            scene.addChild(PIPIHP);
            scene.addChild(PIPIATK);
            scene.addChild(PIPISPEED);

            scene.addChild(label);
            /////////////前面/////////////
            console.log(buttonUpFlag);
            return scene;
        };

//////////////////////////リザルトシーン//////////////////////////////////////////////////////////////////////////////
        var ResultScene = function ()
        {
            var scene = new Scene();

            ////////画像情報処理////////
            //背景
            var resultBack = new Sprite(1280, 720);
            resultBack.image = core.assets['matchingUI/otu.png'];
            resultBack.scale(2.5, 2.5);
            resultBack.x = 960;
            resultBack.y = 480;

            var tapRequest = new Sprite(1280, 200);
            tapRequest.image = core.assets['matchingUI/game_end_tap.png'];
            tapRequest.x = 960;
            tapRequest.y = 1200;

            scene.addChild(resultBack);
            scene.addChild(tapRequest);

            ////////メイン処理////////
            scene.addEventListener(Event.TOUCH_START, function ()
            {
                core.replaceScene(TitleScene());
            });

            return scene;
        };

//////////////////////////ポーズシーン//////////////////////////////////////////////////////////////////////////////
        var PauseScene = function ()
        {
            var scene = new Scene();

            ////////画像情報処理////////
            //背景
            var pauseUI = new Sprite(1024, 256);
            pauseUI.image = core.assets['matchingUI/see_mo.png'];
            pauseUI.scale(1, 1);
            pauseUI.x = 1088;
            pauseUI.y = 800;

            scene.addChild(pauseUI);

            scene.backgroundColor = 'rgba(0,0,0,0.5)';


            scene.addEventListener(Event.TOUCH_START, function (e) {
                //socket.emit("StopEndRequest");
            });

            //socket.on("PushStopEndRequest", function ()
            //{
            //    if (stoppingFlag)
            //    {
            //        stoppingFlag = false;
            //        core.popScene();
            //    }
            //});

            return scene;
        };

        //////////////////////////シーンの読み込み//////////////////////////
        core.replaceScene(TitleScene());

    }
    core.start();
};

/////////////////クラス/////////////////
//デーモンクラス
function Demon(Type, Direction, Level, PlayerID, BaseCost, Cost, HP, ATK, SPEED){
    this.Type = Type;
    this.Direction = Direction;
    this.Level = Level;
    this.PlayerID = PlayerID;
    this.BaseCost = BaseCost;
    this.Cost = Cost;
    this.HP = HP;
    this.ATK = ATK;
    this.SPEED = SPEED;
}
//座標取得クラス
function TapPos(x, y) {
    this.x = x;
    this.y = y;
}
//スピリットクラス
function Spirit(Type, PlayerID, core)
{
    this.Type = Type;
    this.PlayerID = PlayerID;
    this.Sprite = new Sprite(600, 600);
    if (this.Type == "PUPU")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }
    else if (this.Type == "POPO")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }
    else if (this.Type == "PIPI")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }

    this.Sprite.scale(0.3, 0.3);

    this.Sprite.x = Math.floor(Math.random() * 500) + 380;
    this.Sprite.y = Math.floor(Math.random() * 150) + 800;    
}

/////////////////関数/////////////////
function FontSet(_Cost, Digit, Sprite)
{
    if (Digit == 3) {
        Sprite.frame = _Cost / 1000;
    }
    else if (Digit == 2) {
        Sprite.frame = (_Cost % 1000) / 100;
    }
    else if (Digit == 1) {
        Sprite.frame = (_Cost % 100) / 10;
    }
    else if (Digit == 0) {
        Sprite.frame = _Cost % 10;
    }

    return Sprite;
}

function CostCheck(_haveCost, _demon, _Flag)
{
    if (_haveCost - (_demon.Cost + _demon.Level * 10) >= 0) {
        _Flag = "Succes";
    }
    else {
        _Flag = "Faild";
        console.log("Faild");
    }
    return _Flag;
}

function UseCost(_haveCost, _demon)
{
    if (_haveCost - _demon.Cost >= 0)
    {
        _haveCost -= _demon.Cost;
    }
    return _haveCost;
}

function SpiritCheck(_Spirits, _Cost, Length)
{
    var countSpirit = 0;
    for(var i = 0; i < Length; i++)
    {
        //ここでスピリットデータがあるかの確認をする。
        if (_Spirits[i] != null)
        {
            countSpirit += 1;
        }
    }
    //スピリット量が必殺技コストより多い場合trueを返す
    if (countSpirit >= _Cost)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function UsedSpirits(_Spirits, _Cost, Length, scene)
{
    var count = 0;

    for (var i = 0; i < Length; i++)
    {
        if(_Spirits[i] != null)
        {
            scene.removeChild(_Spirits[i].Sprite);
            _Spirits[i] = null;
            count += 1;
            if (count >= _Cost)
                break;
        }
    }

    return _Spirits;
}

function ArrowSet(demon, btn, startPos, endPos, Arrow, core)
{
    //座標の移動幅を見て方向指定
    //上方向時
    if ((startPos.y - endPos.y) > btn.height / 2 * btn.scaleY)
    {
        if (demon.Type == "PUPU")
        {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 2500;
            Arrow.y = -200;
            Arrow.rotation = 0;
        }
        else if (demon.Type == "POPO")
        {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 2500;
            Arrow.y = 400;
            Arrow.rotation = 0;
        }
        else if (demon.Type == "PIPI")
        {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 2500;
            Arrow.y = 1000;
            Arrow.rotation = 0;
        }        
    }
    //下方向時
    else if ((startPos.y - endPos.y) < -btn.height / 2 * btn.scaleY)
    {
        if (demon.Type == "PUPU") {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 2500;
            Arrow.y = 200;
            Arrow.rotation = 180;
        }
        else if (demon.Type == "POPO") {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 2500;
            Arrow.y = 800;
            Arrow.rotation = 180;
        }
        else if (demon.Type == "PIPI") {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 2500;
            Arrow.y = 1400;
            Arrow.rotation = 180;
        }
    }
    //右方向時
    else if ((startPos.x - endPos.x) < -btn.height / 2 * btn.scaleX)
    {
        if (demon.Type == "PUPU") {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 2700;
            Arrow.y = 0;
            Arrow.rotation = 90;
        }
        else if (demon.Type == "POPO") {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 2700;
            Arrow.y = 600;
            Arrow.rotation = 90;
        }
        else if (demon.Type == "PIPI") {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 2700;
            Arrow.y = 1200;
            Arrow.rotation = 90;
        }
    }
    //左方向時
    else if ((startPos.x - endPos.x) > btn.height / 2 * btn.scaleX)
    {
        if (demon.Type == "PUPU") {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 2300;
            Arrow.y = 0;
            Arrow.rotation = 270;
        }
        else if (demon.Type == "POPO") {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 2300;
            Arrow.y = 600;
            Arrow.rotation = 270;
        }
        else if (demon.Type == "PIPI") {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 2300;
            Arrow.y = 1200;
            Arrow.rotation = 270;
        }
    }

    return Arrow;
}

//デーモンの送信
function PushDemon(demon, btn, startPos, endPos, setPlayerID)
{
    //座標の移動幅を見て方向指定
    if ((startPos.y - endPos.y) > btn.height / 2 * btn.scaleY) {
        demon.Direction = "Top";
    }
    else if ((startPos.y - endPos.y) < -btn.height / 2 * btn.scaleY) {
        demon.Direction = "Bottom";
    }
    else if ((startPos.x - endPos.x) < -btn.height / 2 * btn.scaleX || (startPos.x - endPos.x) > btn.height / 2 * btn.scaleX) {
        demon.Direction = "Middle";
    }
    else {
        demon.Direction = "None";
    }
    //プレイヤーID設定
    demon.PlayerID = setPlayerID;

    //データ送信
    if (demon.Direction != "None")
        //socket.emit("DemonPush", { Type: demon.Type, Direction: demon.Direction, Level: demon.Level, PlayerID: demon.PlayerID });

    //ログ出力
    console.log(demon.Type);
    console.log(demon.Direction);
    console.log(demon.Level);
    console.log(demon.PlayerID);
}

//必殺技送信
function PushDeadly(setPlayerID)
{
    //socket.emit("DeadlyPush", { Deadly: "Fire", PlayerID: setPlayerID});
    //console.log("DeadlyPushed");
}

//エラー時アラートが呼び出されるように
window.onerror = function(error)
{
    alert(error);
}