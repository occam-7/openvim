function create_VIM_CONTEXT_HELP(context) {
  var G = VIM_GENERIC;

  function getCommandHelp(keys, description, contexthelp_key) {
    var helpElem = $('<p />', {'class': 'commandhelp'});
    var keyCombination = $('<span />', {'class': 'command_keycombination', 'text': keys});
    var commandDescription = $('<span />', {'class': 'command_description', 'text': description});
    helpElem.append(keyCombination).append(commandDescription);

    if(!!contexthelp_key)
      return helpElem.addClass("helpkey_" + contexthelp_key).addClass('conditional');
		else
      return helpElem;
	}
  
  function addCommandHelp(elem, keys, description, contexthelp_key) {
    getCommandHelp(keys, description, contexthelp_key).appendTo(elem);
  }

  function commandHelp(keys, description, contexthelp_key) {
    var commandMode = $('.command-mode', context);
    addCommandHelp(commandMode, keys, description, contexthelp_key); 
	}

  function addCommandHelps() {
    var insertMode = $('.insert-mode', context);
    
    addCommandHelp(insertMode, "Esc", "切回普通模式");
    commandHelp("i, I", "进入插入模式");
    commandHelp("h, j, k, l", "左、下、上、右移动");
    commandHelp("w, b, e, ge", "按单词移动");
    commandHelp("[n][action/movement]", "重复 n 次，比如 3w");
    commandHelp("x, X", "删除一个字符");
    commandHelp("a, A", "在光标后插入");
    commandHelp("f[char]", "跳到行内下一个指定字符");
    commandHelp("F[char]", "跳到行内上一个指定字符");
    commandHelp("; and ,", "重复上一次 f 或 F");
    commandHelp("f[char]", "跳到行内第 n 个指定字符", "number_f_char");
    commandHelp("/yourtext and then: n, N", "搜索文本");
    commandHelp("d[movement]", "配合移动命令删除");
    commandHelp("r[char]", "替换光标下的字符");
    commandHelp("0, $", "跳到行首/行尾");
    commandHelp("o, O", "新增一行");
    commandHelp("%", "跳到配对的括号");
//    commandHelp("[( or ])", "Goto next/previous parentheses");
    commandHelp("ci[movement]", "修改指定范围内的内容");
    commandHelp("D", "删到行尾");
    commandHelp("S", "清空当前行并进入插入模式");
    commandHelp("g", "跳到文件开头", "g");
    commandHelp("e", "跳到上一个单词末尾", "ge");
    commandHelp("gg / G", "跳到文件开头/结尾");
    commandHelp("G or [number]G", "跳到指定行", "goto_line_g");
    commandHelp("d", "整行", "dd");
    commandHelp("$", "光标到行尾", "end_of_line");
    commandHelp("0", "行首到光标处", "start_of_line");
    commandHelp("w", "到下一个单词开头", "w");
    commandHelp("e", "到当前单词末尾", "e");
    commandHelp("b", "到当前单词开头", "b");
    commandHelp("h, j, k, l", "左、下、上、右", "hjkl");
    commandHelp("[n][movement]", "移动 n 次", "num_movement");
    commandHelp("[char]", "单个字符", "char");
    commandHelp("[movement]", "移动命令，比如 j", "movement");
    commandHelp("yy", "复制当前行");
    commandHelp("y", "复制当前行", "copy_line");
    commandHelp("p", "把复制的内容粘到光标后");
    commandHelp("i[YourText]", "重复插入的文本", "repeat_insert");
    commandHelp("ESC", "取消动作/移动", "chained"); 
    show_help();
	}

  function set_help(contexthelp_keys, chainedActions) {
    $('.commandhelp', context).hide();
    G.for_each(contexthelp_keys, function(key) {
      $('.commandhelp.helpkey_' + key, context).show();
    });
 
    showChainedActions(chainedActions);   
	}

  function showChainedActions(chainedActions) {
     var result = "";
     G.for_each(chainedActions, function(action) {
       result += action + " ";
    });

    result = $.trim(result); 
    $('.context_pressed', context).text(result);
  } 

  
  function show_help() { 
    $('.context_pressed', context).text('');
    $('.commandhelp', context).show();
    $('.commandhelp.conditional', context).hide();
  }

  return {
    'initialize': addCommandHelps,
    'show_help': show_help,
    'set_help': set_help
  };
}
