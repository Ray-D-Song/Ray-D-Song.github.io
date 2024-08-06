function setupLineNum() {
  let lineNum = 0;
  return function() {
    return lineNum++;
  };
}