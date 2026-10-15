
const flightForm = document.getElementById("flightForm");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const departureInput = document.getElementById("departure");
const returnInput = document.getElementById("returnDate");
const returnField = document.getElementById("returnField");
const message = document.getElementById("message");

const tripOptions = document.querySelectorAll('input[name="trip"]');

// Минимальная дата — сегодня.
const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

departureInput.min = localToday;
returnInput.min = localToday;
departureInput.value = localToday;

// Показываем или скрываем дату возвращения.
tripOptions.forEach((option) => {
    option.addEventListener("change", () => {
        const isRoundTrip = option.value === "round" && option.checked;

        returnField.hidden = !isRoundTrip;
        returnInput.required = isRoundTrip;

        if (!isRoundTrip) {
            returnInput.value = "";
        }
    });
});

// Дата возвращения не может быть раньше вылета.
departureInput.addEventListener("change", () => {
    returnInput.min = departureInput.value || localToday;

    if (returnInput.value && returnInput.value < departureInput.value) {
        returnInput.value = "";
    }
});

// Не разрешаем выбирать один и тот же город.
function validateCities() {
    const sameCity = fromSelect.value === toSelect.value;

    toSelect.setCustomValidity(
        sameCity ? "Выберите город, отличный от города вылета." : ""
    );

    return !sameCity;
}

fromSelect.addEventListener("change", validateCities);
toSelect.addEventListener("change", validateCities);

// Поиск демонстрационных рейсов.
flightForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateCities()) {
        toSelect.reportValidity();
        return;
    }

    const tripType = document.querySelector(
        'input[name="trip"]:checked'
    ).value;

    if (
        tripType === "round" &&
        returnInput.value &&
        returnInput.value < departureInput.value
    ) {
        message.textContent =
            "Дата возвращения не может быть раньше даты вылета.";
        returnInput.focus();
        return;
    }

    if (tripType === "round" && !returnInput.value) {
        message.textContent = "Пожалуйста, выберите дату возвращения.";
        returnInput.focus();
        return;
    }

    const from = fromSelect.value;
    const to = toSelect.value;
    const departure = departureInput.value;
    const returnDate = returnInput.value;
    const passengers = document.getElementById("passengers").value;
    const travelClass = document.getElementById("classType").value;

    const params = new URLSearchParams({
        from,
        to,
        departure,
        passengers,
        class: travelClass,
        trip: tripType
    });

    if (tripType === "round") {
        params.set("returnDate", returnDate);
    }

    message.textContent =
        `Поиск: ${from} → ${to}. Дата вылета: ${departure}. ` +
        `Пассажиров: ${passengers}. Класс: ${travelClass}.`;

    // Демонстрируем параметры поиска в адресной строке.
    history.replaceState(null, "", `?${params.toString()}`);

    // Здесь можно подключить API авиабилетов и вывести реальные рейсы.
});

// Кнопки популярных направлений.
document.querySelectorAll(".destination-button").forEach((button) => {
    button.addEventListener("click", () => {
        const city = button.dataset.city;

        if ([...toSelect.options].some((option) => option.value === city)) {
            toSelect.value = city;
        }

        if (fromSelect.value === city) {
            fromSelect.value = "Бишкек";
        }

        validateCities();

        document.getElementById("search").scrollIntoView({
            behavior: "smooth"
        });

        toSelect.focus();
    });
});