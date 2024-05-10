this.setListeners()

function setListeners() {
    document
        .getElementById('button:generate-variables')
        .addEventListener('click', this.onGenerateButtonClick.bind(this))
    document.getElementById('button:copy-variables').addEventListener('click', this.onCopyButtonClick.bind(this))
}

function onTextareaChange() {
    this.resetTextareaErrors()
    this.resetErrors()
}

function onGenerateButtonClick() {
    this.resetTextareaErrors()
    this.resetErrors()

    const value = document.getElementById('textarea:input').value.trim()
    if (!value) {
        this.setTextareaError('textarea:input')
        this.updateInfoText('generate-text', "There's no json code in the textarea above.", true)
        return
    }

    if (!this.isJSON(value) || (value[0] !== '{' && value[0] !== '[')) {
        this.setTextareaError('textarea:input')
        this.updateInfoText('generate-text', 'Invalid JSON', true)
        return
    }

    let outputString = ''
    for (const varSet of JSON.parse(value)) {
        for (const property in varSet) {
            for (const x of this.generateVariables(varSet[property]['modes']['Mode 1'])) {
                if (outputString !== '') outputString += '\n'
                outputString += `--${x};`
            }
        }
    }
    document.getElementById('textarea:output').value = outputString

    this.updateInfoText('generate-text', 'Your variables have been generated.', false)
}

function isJSON(value) {
    try {
        JSON.parse(value)
    } catch (err) {
        return false
    }

    return true
}

function generateVariables(obj) {
    const strArr = []
    for (const property in obj) {
        const value = obj[property]['$value']
        if (!value) {
            for (const str of this.generateVariables(obj[property])) {
                strArr.push(`${property}-${str}`)
            }
        } else {
            let newValue = ''
            if (value[0] === '{') {
                newValue = `var(--${value.slice(1, -1).split('.').join('-')})`
            } else if (!Number.isNaN(Number(value))) {
                newValue = `${value}px`
            } else {
                newValue = value
            }
            strArr.push(`${property}: ${newValue}`)
        }
    }
    return strArr
}

async function onCopyButtonClick() {
    this.resetTextareaErrors()
    this.resetErrors()

    const $textareaOutput = document.getElementById('textarea:output')
    const output = $textareaOutput.value

    const isBadContent = new Set([$textareaOutput.hasAttribute('data-error'), output === ''])
    if (isBadContent.has(true)) {
        this.setTextareaError('textarea:output')
        this.updateInfoText('copy-text', "There's nothing to copy.", true)
        return
    }

    const res = await navigator.clipboard.writeText(output)
    if (res instanceof DOMException) {
        this.updateInfoText('copy-text', 'Failed to copy.', true)
        return
    }
    this.updateInfoText('copy-text', 'Your variables have been copied.', false)
}

function updateInfoText(id, text, isError = false) {
    const $infoText = document.getElementById(id)
    $infoText.innerText = text
    $infoText.classList.toggle('hidden', false)

    if (isError) {
        $infoText.classList.add('text-red-600')
        $infoText.classList.remove('text-gray-600')
    } else {
        $infoText.classList.remove('text-red-600')
        $infoText.classList.add('text-gray-600')
    }
}

function setTextareaError(id) {
    const $textarea = document.getElementById(id)
    $textarea.classList.add('border-red-600')
}

function resetTextareaErrors() {
    for (const id of ['textarea:input', 'textarea:output']) {
        const $textarea = document.getElementById(id)
        $textarea.classList.remove('border-red-600')
    }
}

function resetErrors() {
    document.getElementById('copy-text').classList.toggle('hidden', true)
    document.getElementById('generate-text').classList.toggle('hidden', true)
}
