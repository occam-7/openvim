function register_VIM_TUTORIAL_SECTIONS(interpreter, messager, createSection, registerSection, showCommandOneByOne, doc) {
  var G = VIM_GENERIC;

  var pressEnterToContinue = "按回车继续";

  function showInfo(text) { $('.info').text(text); } //.show(); }

  function sendMessageAsync(message) { setTimeout(function() { messager.sendMessage(message); }, 0); }
  
  function requireEnterToContinue() { showCommandOneByOne(["Enter"], accepterCreator); }
  function waitPressToGotoPractice(waitCode, waitKey) {
      messager.sendMessage('waiting_for_code', { 'end': false, 'code': waitCode });
      var forAbortId = messager.listenTo('pressed_key', function (key) {
        console.log("key", key)
          if (key === waitKey) {
              window.location = 'sandbox.html';
              messager.removeListener('pressed_key', forAbortId);
          }
      });
  }

  function defaultPre() { interpreter.environment.setInsertMode(); }

  function defaultPost() {
    interpreter.environment.setCommandMode();
    showInfo(pressEnterToContinue);
    requireEnterToContinue();
  }

  /** FIXME: should reuse existing code/key functionality */
  var accepterCreator = function(command) {
    var accepter = function(key) {
      if(command === 'ctrl-v') return key === 22 || ($.browser.mozilla && key === 118); //XXX: ugly and don't even work properly
      if(command === "Esc") return key === 27;
      if(command === "Enter") return key === 13;

      var keyAsCode = G.intToChar(key);
      var neededCode = command;
      
      return keyAsCode === neededCode;
    };

    return accepter;
  };

  function cmd(code, postFun) {
      return {
        'code': code,
        'postFun': postFun
      };
    }

    /** TEMPORARY duplication */
    function writeChar(code) {
      var $ch = $(doc.getChar(code));
      $ch.insertBefore($('.cursor'));
    }

    function insertText(text, newline) {
      var mode = interpreter.environment.getMode();

      interpreter.environment.setInsertMode();
      
      newline = newline !== undefined ? newline : true;

      if(newline) {
        interpreter.interpretSequence(["Esc", "o"]);
      }

      var words = text.split(" ");

      G.for_each(words, function(word) {
        //interpreter.interpretSequence(word);
        G.for_each(word, writeChar);
        interpreter.interpretOneCommand("Space");
      });

      interpreter.environment.setMode(mode);
    }

  var introduction_section = createSection("介绍",
        defaultPre,
    [
        "你好。",
        "我是一个交互式的 |Vim| 教程。",
        "我会讲清楚 Vim 是怎么回事，不绕弯子。着急的话，随便按一个键就能快进。",
        "想练手就去 |练习| 页，那里的命令速查表会跟着你按的键变。",
        "现在先看看 Vim 的基础。"
    ], defaultPost);

    var two_modes_section = createSection("两种模式：插入和普通",
        defaultPre,
    [
        "Vim 有两种基本模式。|插入|模式下，你像用普通文本编辑器一样打字。",
        "|普通|模式下，你用命令移动和修改文本。",
        "当前在哪个模式，看编辑器顶上的状态栏就知道。",
        "|Esc| 切回普通模式，|i| 进入插入模式。",
        "动手试试，先切到插入模式。"
    ],
    function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(
            [
             cmd("i", function() {
               $('.screen_view').addClass('active_context');
               insertText("现在你在插入模式了。写几个字，然后切回普通模式。");
             }),
             cmd("Esc", function() {
               $('.screen_view').removeClass('active_context');
               interpreter.environment.interpretOneCommand("G");
               insertText("好，继续下一节。");
             }),
             "Enter"
            ],
            accepterCreator);
    }
    );

    var basic_movement = createSection("基本移动：h、j、k、l",
        defaultPre,
    [
        "普通编辑器用方向键移动光标，Vim 用 |h| |j| |k| |l|：左、下、上、右。",
        "试着按提示走一圈。"
    ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "h", "h", "h", "k", "l", "l", "h", "h", "j",
          cmd("Enter", function() {
            insertText("继续下一节。");
          }), "Enter"],
          accepterCreator);
    });

    var word_movement = createSection("按单词移动：w、e、b",
        defaultPre,
      [
        "按单词跳要用 |w| |b| |e|（真实 Vim 里还有大写 W、B、E）。",
        "|w| 跳到下一个单词开头，|e| 跳到当前单词末尾，|b| 跳回单词开头。",
        "下面这行英文用来练手。",
        "w moves to the start of next word; e moves to the end of the word; and b moves to beginning of the word."
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("Fn"); // cursor to "begin[n]ing"
        showCommandOneByOne([
          "b", "e", "b", "w", "e", "w", "e", "b",
          cmd("Enter", function() {
            insertText("单词级的跳转，继续。");
          }), "Enter"],
          accepterCreator);
    });

    var times_movement = createSection("带数字的移动，比如 5w",
      defaultPre,
      [
          "移动不限于一次一个键，还可以和 |数字| 组合。|3w| 就是把 w 按三次。",
          "下面这行英文用来练手。",
          "The quick brown fox jumps over the lazy dog again and again."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("0");
        showCommandOneByOne(["3", "w", "9", "l", "2", "b",
            cmd("Enter", function() { insertText("有了数字，就不用把同一个键按上好几遍。") }),
            "Enter"
        ],
        accepterCreator)
      });

    var times_inserting = createSection("重复插入，比如 3iYes",
        defaultPre,
        [
            "同一段文字可以一次插进好几份。",
            "标题下面的下划线常常是 30 个 |-|。",
            "------------------------------",
            "用 |30i-| |Esc|，就不用把 |-| 按 30 次。",
            "试一下：把 |go| 连着插入三次。"
        ],
        function() {
            interpreter.environment.setCommandMode();
            showCommandOneByOne(
                ["3", "i", "g", "o", "Esc",
                cmdWithText("Enter", "看，10i 加一段文字再加 Esc，就能插十遍。"),
                "Enter"
                ], accepterCreator)
        });

    var find_occurrence = createSection("查找字符：f 和 F",
        defaultPre,
        [
            "在一行里找下一个（或上一个）出现的字符并跳过去，用 |f| 和 |F|，比如 |fo| 找下一个 o。",
            "f 也能带数字，|3fq| 找第三个 q。",
            "下面这行英文用来练手。",
            "Practice: w then s then q q q and quit quickly."
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence("0");
          showCommandOneByOne(["f", "w", "f", "s", "3", "f", "q",
              cmd("Enter", function() { insertText("又快又准。") }),
              "Enter"
          ], accepterCreator)
        });

    var matching_parentheses = createSection("跳到配对的括号：%",
      defaultPre,
      [
        "文本里有 |(| |{| |[| 这类括号时，用 |%| 跳到配对的另一半。",
        "下面这行英文用来练手。",
        "Here is (a sample) text to try that."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence(["F", "("]);
        showCommandOneByOne(["%", "%", "Enter"], accepterCreator)
      });

    var start_and_end_of_line = createSection("跳到行首和行尾：0 和 $",
      defaultPre,
      [
        "跳到行首，按 |0|。",
        "跳到行尾，按 |$|。"
      ],
      function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(["0", "$", "0", "Enter"], accepterCreator)
      });

    var word_under_cursor = createSection("查找光标下的单词：* 和 #",
      defaultPre,
        [
         "|*| 找光标下这个单词的下一次出现，|#| 找上一次。",
         "下面这行英文里，同一个单词出现了四次。",
         "word word word and then word again"
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence(["0", "w"]);
          showCommandOneByOne(["*", "*", "#",
              cmd("#", function() {
                insertText("还是原来那个词。")
              }), "Enter"], accepterCreator)
        });

    var goto_line = createSection("跳到指定行：g 和 G",
        defaultPre,
        [
         "|gg| 跳到文件开头，|G| 跳到文件结尾。",
         "想直接跳到第几行，就把 |行号| 和 |G| 一起按。",
         "先用 |gg| 跳到本屏开头，再用 |G| 跳回结尾。"
        ],
        function() {
          interpreter.environment.setCommandMode();
          showCommandOneByOne(["g", "g", "G",
             cmd("Enter", function() {
                 insertText("用 2G 跳到第 2 行。");
             }),
             "2", "G",
             cmd("Enter", function() {
                insertText("gg！G 挺好用的。")
             }), "Enter"
          ], accepterCreator)
        });

    var search_match = createSection("搜索：/text、n 和 N",
      defaultPre,
      [
        "搜索是编辑器的核心功能。Vim 里按 |/|，再输入要找的内容。",
        "用 |n| 跳到下一个匹配，用 |N| 跳到上一个。",
        "真实 Vim 里还能用正则表达式找特定形式的文本。",
        "先试一次简单的文本搜索。",
        "搜索 |text|，然后用 |n| 往下跳。",
        "Practice: this text line mentions text and that text once more."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("1G");
        showCommandOneByOne(
          ["/", "t", "e", "x", "t", "Enter", "n", "n", "N", "N",
          cmd("Enter",
            function() {
              interpreter.interpretSequence(["/", "Esc"]);
              insertText("搜索就是一路 n 下去。");
            }),
          "Enter"], accepterCreator
        )
      });

    var removing = createSection("删除字符：x 和 X",
        defaultPre,
      [
      "|x| 删掉光标下的那个字符，|X| 删掉光标左边那个字符。",
      "按 |x| 把行尾的几个字符删掉试试。"
      ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "x", "x", "x", "x", "x",
          cmd("x", function() {
             insertText("有时候线索就藏在那个 (x) 里。");
          }),
            /*
          "X", "X", "X", "X", "X",
          cmd("X", function() {
            //insertText("You removed yourself from this section. Next!");
          }),
          */
          "Enter"],
          accepterCreator);
    });

    var replacing = createSection("替换光标下的字符：r",
        defaultPre,
      [
      "只想换掉光标下的一个字符，又不想进插入模式，就用 |r|。",
      "下面这行英文用来练手。",
      "Replace my"
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("Fy");
        showCommandOneByOne([
          "r", "e", "Enter"],
          accepterCreator);
    });

    function cmdWithText(command, text) {
        return cmd(command, function() {
                 insertText(text);
               });
    }

    function setActiveContext() { $('.screen_view').addClass('active_context'); }
    function unsetActiveContext() { $('.screen_view').removeClass('active_context'); }

    var adding_line = createSection("插入新行：o 和 O",
      defaultPre,
        [
            "在当前行下面开一行，按 |o|；在上面开一行，按 |O|。",
            "新行建好后，编辑器会自动切到 |插入| 模式。",
            "写几个字，再回到 |普通| 模式。"
        ], function() {
            interpreter.environment.setCommandMode();
            interpreter.interpretSequence(["2", "G"]);
            showCommandOneByOne([
                cmd("o", function() {
                    setActiveContext();
                }),
                cmd("Esc", function() {
                    unsetActiveContext();
                    insertText("对，大写 O 就是在当前行上面开一行。");
                    interpreter.environment.setCommandMode();
                }),
                cmd("O", setActiveContext),
                cmd("Esc",
                    function() {
                        insertText("现在你的表情大概是 O___o。");
                        unsetActiveContext();
                    }), "Enter"
            ], accepterCreator)
        });

    var deleting = createSection("删除命令 d",
        defaultPre,
      [
      "|d| 是删除命令。",
      "它要和移动配合用，比如 |dw| 删掉光标右边的一个单词。",
      "真实 Vim 里被删掉的内容会存起来，用 |p| 可以粘到别处。",
      "先按 |0| 回到行首，再用 |dw| 删掉这行英文的第一个单词。",
      "Practice: the first word of this line disappears."
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.environment.interpretOneCommand("0");
        showCommandOneByOne([
          "d", "w",
          cmd("Enter", function() {
            insertText("The word is gone. Now let's remove two words with d2e.");
            interpreter.environment.interpretSequence(["0"]);
          }),
          "d", "2", "e",
          cmd("Enter", function() {
            insertText("现在不用再纠结 de 还是不 de 了。");
          }), "Enter"],
          accepterCreator);
    });

  var repetition = createSection("用 . 重复上一条命令",
    defaultPre,
    [
        "重复上一条命令，按 |.| 就行。",
        "先用 |d2w| 删掉两个单词。",
        "然后用 |.| 把这行剩下的单词删光。",
        "Practice: dot repeats the last command on this line again and again and again."
    ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretOneCommand("0");
        showCommandOneByOne([
            "d", "2",
            "w", ".", ".", ".", ".", ".",
          cmd("Enter", function() {
            insertText("重复是句号的本源。")
          }),
            "Enter"
        ], accepterCreator)
      });

  var visual_mode = createSection("可视模式：v",
    defaultPre,
    [
      "除了插入模式和普通模式，Vim 还有 |可视| 模式。",
      "可视模式下，先用移动键选中文本，再决定对选中的内容做什么。",
      "按 |v| 进入可视模式，用 |e| 选中一个单词，然后按 |d| 删掉它。",
      "Practice: visual mode selects text before you change it."
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("4b");
      showCommandOneByOne(
        ["v", "e", "l", "d",
          cmdWithText("Enter", "（手感不错，就是丢了几个词。）"), "Enter"
        ], accepterCreator)
    });

  var visual_block_mode = createSection("可视块模式：ctrl-v",
    defaultPre,
    [
      "还有一种模式叫 |可视块|，可以一次在好几行上插入文字。用一个清单当例子。",
      "<> A smart girl",
      "<> Ulysses",
      "<> Learn and teach",
      "先把光标移到要插入的位置，按 |ctrl-v| 进入可视块模式。上下移动光标选中几行，按 |I| 在选中的区域前面插入文字，|Esc| 完成插入。"
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("2G");
      showCommandOneByOne(["l", "ctrl-v", "j", "j", "I", "o", "Esc",
        cmdWithText("Enter", "块是前进路上的障碍。"), "Enter"],
        accepterCreator);
    });

  var last_commands = createSection("接下来是真正的 Vim",
        defaultPre,
    [
        "到这里，你应该有底气打开真正的 Vim 了。",
        "最该记住的命令：|:w| 保存，|:q| 退出，|:q!| 不保存退出。",
        "按错了也别慌，|u| 撤销，|ctrl+R| 重做。",
        "遇到问题，或者想学更多，输入 |:help|。"
    ],
        defaultPost
    );

  var the_end = createSection("结束", defaultPre,
      [
        "谢谢你的时间，希望玩得开心。",
        "想在练习编辑器里自由敲命令，按 |空格|。",
        "再见！"
      ], () => waitPressToGotoPractice('Space', 32));

  // append a and A
  // J join lines

  /**********************************************
   * Later
   **********************************************/

  // undo
  // change inside parentheses
  // macro

  /**********************************************
   * Register sections
   **********************************************/

    registerSections([
      introduction_section,
      two_modes_section,
      basic_movement,
      word_movement,
      times_movement,
      times_inserting,
      find_occurrence,
      matching_parentheses,
      start_and_end_of_line,
      word_under_cursor,
      goto_line,
      search_match,
      adding_line,
      removing,
      replacing,
      deleting,
      repetition,
      visual_mode,
      //visual_block_mode, // TODO enable when ctrl-v works with most browsers
      last_commands,
      the_end
    ]);

  function registerSections(sections) {
    G.for_each(sections, function(section) {
      registerSection(section);
    });
  }
}
