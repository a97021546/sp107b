var fs = require("fs"); // 加載 file system
var c  = console;
var file = process.argv[2];

var dtable = { 
  ""   :'000',
  "M"  :'001',
  "D"  :'010',
  "MD" :'011',
  "A"  :'100',
  "AM" :'101',
  "AD" :'110',
  "AMD":'111'
}

var jtable = {
  ""   :'000',
  "JGT":'001',
  "JEQ":'010',
  "JGE":'011',
  "JLT":'100',
  "JNE":'101',
  "JLE":'110',
  "JMP":'111'
}

var ctable = {
  "0"   :'0101010',
  "1"   :'0111111',
  "-1"  :'0111010',
  "D"   :'0001100',
  "A"   :'0110000', 
  "M"   :'1110000',
  "!D"  :'0001101',
  "!A"  :'0110001', 
  "!M"  :'1110001',
  "-D"  :'0001111',
  "-A"  :'0110011',
  "-M"  :'1110011',
  "D+1" :'0011111',
  "A+1" :'0110111',
  "M+1" :'1110111',
  "D-1" :'0001110',
  "A-1" :'0110010',
  "M-1" :'1110010',
  "D+A" :'0000010',
  "D+M" :'1000010',
  "D-A" :'0010011',
  "D-M" :'1010011',
  "A-D" :'0000111',
  "M-D" :'1000111',
  "D&A" :'0000000',
  "D&M" :'1000000',
  "D|A" :'0010101',
  "D|M" :'1010101'
}

var symTable = {
  "R0"  :'0',
  "R1"  :'1',
  "R2"  :'2',
  "R3"  :'3',
  "R4"  :'4',
  "R5"  :'5',
  "R6"  :'6',
  "R7"  :'7',
  "R8"  :'8',
  "R9"  :'9',
  "R10" :'10',
  "R11" :'11',
  "R12" :'12',
  "R13" :'13',
  "R14" :'14',
  "R15" :'15',
  "SP"  :'0',
  "LCL" :'1',
  "ARG" :'2',
  "THIS":'3', 
  "THAT":'4',
  "KBD" :'24576',
  "SCREEN":'16384'
};

var symTop = 16; // 新的變數從 16 開始，前 15 個為預設指令
var symlocation = 0;

function addSymbol(symbol) {  // 增加變數
  symTable[symbol] = symTop; // 將新的變數放進 symTable 裡面
  symTop ++; 
}

assemble(file+'.asm', file+'.hack');                // assemble(輸入檔案為 asm 檔 , 輸出檔案為 hack 檔)

function assemble(asmFile, objFile) {               // assemble(輸入 , 輸出) // 利用正規表達式處理
  var asmText = fs.readFileSync(asmFile, "utf8");   // 讀取檔案到 text 字串中 // 第一步驟：讀檔
  var lines   = asmText.split(/\r?\n/);             // 將組合語言分割成一行一行 // 第二步驟：將字串拆行變陣列 // \r carriage return（回車鍵，回到頭） // \n 換行 // ? 比對前一個字元，0次或1次 // split("t") 000t111t222 --> {000, 111, 222} 以 t 分割
  for (line of lines) {
    line.match(/^([^\/]*)(\/.*)?$/) // 比對註解
    line = RegExp.$1.trim(); // 把前後空白去掉
    if (line.length != 0) 
      pass(line);
  }
  for (var i = 0; i < lines.length; i++) {
    parser (lines[i]);
  }
}

function parser(line, i) {
  line.match(/^([^\/]*)(\/.*)?$/);
  line = RegExp.$1.trim();

  // 判斷該行為空
  if (line.length === 0)
  return null;

  // A 指令
  if (line.startsWith("@")) {
    var num = line.substring(1).trim() // 只保留 @ 後面的數字
    if (num.match(/^\d+$/)) {
      num = num - 0 // 轉成數字
      var numbinary = num.toString(2) // 十進位轉二進位
      numbinary = "0" + numbinary // 對齊
      var numlength = numbinary.length 
      for (var i = 0; i < 16 - numlength; i++) { // 前面補零
        numbinary = "0" + numbinary
      }
      c.log(line)
      c.log(numbinary)
    }

    // A 指令（變數的部分） 
    else {
      if (symTable[num] === undefined) {
        symTable[num] = symTop;
        symTop++;
      }
      var num2 = symTable[num];
      num2 = num2 - 0
      var num2binary = num2.toString(2)
      num2binary = "0" + num2binary
      var num2length = num2binary.length
      for (var j = 0; j < 16 - num2length; j++) {
        num2binary = "0" + num2binary
      }
      c.log(line)
      c.log(num2binary)
    } 
  }

    // C 指令
    else {   
      if (line.indexOf("=") != -1) { // 判斷 line 中是否有 =
        lengths = line.split("=")
        numbinary = "111" + ctable[lengths[1]] + dtable[lengths[0]] + "000"
        c.log(line)
        c.log(numbinary)
      }
      else if (line.indexOf(";") !=-1) { // 判斷 line 中是否有 ;
        lengths = line.split(";")
        numbinary = "111" + ctable[lengths[0]] + "000" + jtable[lengths[1]]
        c.log(line)
        c.log(numbinary)
      }
    }
  }

// Symbol 指令
function pass(line) {
  if (line[0] == "(") {
    line.match(/^\(([^\)]+)\)$/);
    var word = RegExp.$1;
    symTable[word] = symlocation;
  }
  else
  symlocation++;
}