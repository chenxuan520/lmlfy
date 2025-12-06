document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('main-form');
    const resultContainer = document.getElementById('result-container');
    const resultLinkInput = document.getElementById('result-link');
    const copyButton = document.getElementById('copy-button');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const question = document.getElementById('question').value;
        const engine = document.getElementById('engine').value;

        if (!question.trim()) {
            alert('问题不能为空！');
            return;
        }

        const encodedQuestion = encodeURIComponent(question);

        const currentUrl = window.location.href.split('?')[0].replace(/index\.html$/, '');

        const shareableLink = `${currentUrl}answer.html?engine=${engine}&q=${encodedQuestion}`;

        resultLinkInput.value = shareableLink;
        resultContainer.classList.remove('hidden');

        // Scroll to the result
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    });

    copyButton.addEventListener('click', () => {
        resultLinkInput.select();
        document.execCommand('copy');
        copyButton.textContent = '已复制!';
        setTimeout(() => {
            copyButton.textContent = '复制';
        }, 2000);
    });
});
