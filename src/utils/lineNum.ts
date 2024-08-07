function setupLineNum(codeTag: HTMLElement) {
  let lineNum = 0
  const lines = codeTag.querySelectorAll('.line')
  lines.forEach((line) => {
    lineNum++
    const lineNumEle = document.createElement('span')
    lineNumEle.className = 'line-num'
    lineNumEle.innerText = lineNum.toString()
    line.prepend(lineNumEle)
  })
}

export default setupLineNum