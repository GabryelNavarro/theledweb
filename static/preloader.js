document.addEventListener("DOMContentLoaded", async function () {
    var percentageElement = document.querySelector('.porcent');

    function updatePercentage(percentage) {
        percentageElement.textContent = percentage + '%';
    }

    function animatePercentage(duration) {
        var startTime = performance.now(); // Obtém o tempo atual de alta resolução

        return new Promise(resolve => {
            function animate(time) {
                var progress = time - startTime;
                var percentage = Math.round((progress / duration) * 100);
                updatePercentage(percentage);

                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(animate);
        });
    }

    function fadeOut(element, duration) {
        return new Promise((resolve) => {
            var startOpacity = 1;
            var startTime = performance.now(); // Obtém o tempo atual de alta resolução

            function animate(time) {
                var progress = time - startTime;
                var opacity = startOpacity - progress / duration;

                if (opacity >= 0) {
                    element.style.opacity = opacity;
                } else {
                    element.style.opacity = 0;
                    element.style.display = 'none';
                    resolve();
                }

                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);
        });
    }

    // Ajuste o valor 300 para a duração desejada da animação da porcentagem
    await animatePercentage(1400);

    // Ajuste o valor 1000 para a duração desejada do fading out
    await fadeOut(document.querySelector('.preloader'), 2000);

    // Pode adicionar redirecionamento ou outras ações após a conclusão da animação
    // window.location.href = "index.html";
});
