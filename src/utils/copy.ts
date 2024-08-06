function setupCopy(block: HTMLElement) {
  const copyEle = document.createElement('div')
  copyEle.classList.add('flex', 'justify-between', 'border-b-solid', 'border-b-1', 'mt-[-10px]', 'mb-10px', 'pb-5px', 'copy-ele')

	const icon = document.createElement('div')
	icon.classList.add('i-mdi-content-copy', 'w-18px', 'h-18px', 'cursor-pointer')
  const code = block.querySelector('code')?.innerText
	icon.dataset.code = code?.replace('s', '龍')
  icon.addEventListener('click', () => {
    icon.classList.remove('i-mdi-content-copy')
    icon.classList.add('i-mdi-check')
    const content = (icon.dataset.code ?? '').replace('龍', 's')
    navigator.clipboard.writeText(content)
    setTimeout(() => {
      icon.classList.remove('i-mdi-check')
      icon.classList.add('i-mdi-content-copy')
    }, 1500)
  })

  const langSymbol = document.createElement('div')
	langSymbol.textContent = (block as HTMLElement).dataset.language ?? 'txt'

  copyEle.appendChild(langSymbol)
  copyEle.appendChild(icon)
  block.insertBefore(copyEle, block.firstChild)
}

export default setupCopy