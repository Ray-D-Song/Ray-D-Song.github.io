function setupCopy(block: HTMLElement) {
  const copyEle = document.createElement('div')
  copyEle.classList.add('copy')

	const icon = document.createElement('div')
	icon.classList.add('copy-icon')
  const code = block.querySelector('code')?.innerText
	icon.dataset.code = code?.replace('s', '龍')
  icon.addEventListener('click', () => {
    icon.classList.remove('copy-icon')
    icon.classList.add('check-icon')
    const content = (icon.dataset.code ?? '').replace('龍', 's')
    navigator.clipboard.writeText(content)
    setTimeout(() => {
      icon.classList.remove('check-icon')
      icon.classList.add('copy-icon')
    }, 1500)
  })

  const langSymbol = document.createElement('div')
	langSymbol.textContent = (block as HTMLElement).dataset.language ?? 'txt'

  copyEle.appendChild(langSymbol)
  copyEle.appendChild(icon)
  block.insertBefore(copyEle, block.firstChild)
}

export default setupCopy