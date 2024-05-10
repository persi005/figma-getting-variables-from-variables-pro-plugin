const $textareaInput = document.getElementById('textarea:input')
const $textareaOutput = document.getElementById('textarea:output')

const $copyButton = document.getElementById('button:copy-variables')
$copyButton.addEventListener('click', this.onCopyButtonClick.bind(this))

function onCopyButtonClick() {
    this.resetErrors()

    const contentToCopy = new Set([$textareaOutput.hasAttribute('data-error'), $textareaOutput.value === ''])
    if (contentToCopy.has(false)) {
        return this.updateErrorText('copy-error-text', "There's nothing to copy.")
    }
}

function updateErrorText(id, message) {
    const $copyErrorText = document.getElementById(id)
    $copyErrorText.innerText = message
    $copyErrorText.classList.toggle('hidden', false)
}

function resetErrors() {
    document.getElementById('copy-error-text').classList.toggle('hidden', true)
    document.getElementById('generate-error-text').classList.toggle('hidden', true)
}

const $generateButton = document.getElementById('button:generate-variables')
$generateButton.addEventListener('click', this.onGenerateButtonClick.bind(this))

function onGenerateButtonClick() {
    this.resetErrors()

    const value = $textareaInput.value.trim()
    if (!value) {
        return this.updateErrorText('generate-error-text', "There's no json code in the textarea above.")
    }

    if (!this.isJSON(value) || (value[0] !== '{' && value[0] !== '[')) {
        return this.changeOutputTextarea('Invalid JSON', true)
    }

    let outputString = ''
    for (const varSet of JSON.parse(value)) {
        for (const property in varSet) {
            for (const x of this.getVariables(varSet[property]['modes']['Mode 1'])) {
                if (outputString !== '') outputString += '\n'
                outputString += `--${x};`
            }
        }
    }

    this.changeOutputTextarea(outputString)
}

function generateVariables(obj) {
    const strArr = []
    for (const property in obj) {
        const value = obj[property]['$value']
        if (!value) {
            for (const str of this.getVariables(obj[property])) {
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

function isJSON(value) {
    try {
        JSON.parse(value)
    } catch (err) {
        return false
    }

    return true
}

function changeOutputTextarea(output, isError = false) {
    const errorClasses = ['border-red-600', 'border-2', 'text-red-600']
    const defaultClasses = ['border-gray-200']

    $textareaOutput.value = output
    if (isError) {
        $textareaOutput.classList.remove(...defaultClasses)
        $textareaOutput.classList.add(...errorClasses)
    } else {
        $textareaOutput.classList.remove(...errorClasses)
        $textareaOutput.classList.add(...defaultClasses)
    }

    $textareaOutput.toggleAttribute('data-error', isError)
    $textareaOutput.toggleAttribute('disabled', isError)
    $textareaOutput.toggleAttribute('readonly', !isError)
}
