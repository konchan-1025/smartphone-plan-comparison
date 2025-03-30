const planData = {
    "Y!mobile": {
        "シンプル2S": { price: "2365", data: "4" },
        "シンプル2M": { price: "4015", data: "20" },
        "シンプル2L": { price: "5110", data: "30" }
    },
    "UQ": {
        "ミニミニプラン": { price: "2277", data: "4" },
        "トクトクプラン": { price: "2365", data: "15" },
        "コミコミプラン": { price: "3278", data: "20" }
    },
    "SoftBank": {
        "ミニフィットプラン+ ~1GB": { price: "3278", data: "1" },
        "ミニフィットプラン+ ~2GB": { price: "4378", data: "2" },
        "ミニフィットプラン+ ~3GB": { price: "5478", data: "3" },
        "メリハリ無制限+": { price: "7425", data: "無制限" }
    },
    "au": {
        "スマホミニプラン+ ~1GB": { price: "4708", data: "1" },
        "スマホミニプラン+ ~3GB": { price: "6358", data: "3" },
        "スマホミニプラン+ ~5GB": { price: "8008", data: "5" },
        "使い放題MAX+": { price: "7458", data: "無制限" }
    },
    "docomo": { // docomo のプランをここに追加
        "irumo 0.5GB": { price: "550", data: "0.5" },
        "irumo 3GB": { price: "2167", data: "3" },
        "irumo 6GB": { price: "2827", data: "6" },
        "irumo 9GB": { price: "3377", data: "9" },
        "eximo ~1GB": { price: "4565", data: "1" },
        "eximo ~3GB": { price: "5665", data: "3" },
        "eximo 3GB~無制限": { price: "7315", data: "無制限" },
        "ahamo": { price: "2970", data: "30" },
        "ahamo 大盛り": { price: "4950", data: "110" }
    }
};


document.addEventListener('DOMContentLoaded', function() {
    const dataUsageSelect = document.getElementById('data-usage');
    let carrierCheckboxes = document.querySelectorAll('input[name="carrier"]');
    const filterButton = document.getElementById('filter-button');
    const planTableBody = document.querySelector('#plan-table tbody');
    const noResultsMessage = document.getElementById('no-results');

    const dataUsageOrder = ["0.5", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "20", "30", "40以上", "無制限"];

    function getDataUsageValue(usage) {
        return dataUsageOrder.indexOf(usage);
    }

        // チェックボックスのDOM要素を生成する関数
    function createCheckbox(carrier, isChecked) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'carrier';
        checkbox.value = carrier;
        checkbox.checked = isChecked;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(carrier));
        return label;
    }

    function updateCarrierCheckboxes() {
    const carrierOptionsDiv = document.querySelector('.carrier-options');
    carrierOptionsDiv.innerHTML = ''; // 一旦クリア

    const carriersOrder = ["docomo", "au", "SoftBank", "UQ", "Y!mobile"];
    const checkedCarriers = Array.from(carrierCheckboxes)
                                    .filter(checkbox => checkbox.checked)
                                    .map(checkbox => checkbox.value);
    
    // 並び順に基づいてチェックボックスを作成
    carriersOrder.forEach(carrier => {
        // docomo が存在しない場合にエラーが発生するのを防ぐため、チェックを行う
        const isChecked = checkedCarriers.includes(carrier);
        const checkbox = createCheckbox(carrier, isChecked);
        carrierOptionsDiv.appendChild(checkbox);
    });
    // 新しいチェックボックスをイベントリスナーに登録し直す
    carrierCheckboxes = document.querySelectorAll('input[name="carrier"]');
}

    function displayPlans(selectedDataUsage, selectedCarriers) {
        planTableBody.innerHTML = ''; // Clear previous results
        noResultsMessage.style.display = 'none'; // Hide "No Results" message

        let availablePlans = []; // 候補となるプランを格納する配列

        for (const carrier in planData) {
            if (selectedCarriers.includes(carrier)) {
                // キャリアが選択されている場合のみ処理を行う
                let carrierDisplayName = carrier;

                let bestPlan = null;
                let bestPrice = Infinity;
                
                // 選択されたデータ容量を数値に変換
                let selectedDataUsageValue = selectedDataUsage === "無制限" ? Infinity : (selectedDataUsage === "40以上" ? 40 : parseFloat(selectedDataUsage));

                let hasExactMatch = false; // ジャストプランが見つかったかどうか

                // プランを探索
                for (const planName in planData[carrier]) {
                    // プランのデータ容量を取得し、数値に変換
                    const dataUsage = planData[carrier][planName].data;
                    const dataUsageValue = dataUsage === "無制限" ? Infinity : parseFloat(dataUsage);
                    const price = parseInt(planData[carrier][planName].price);

                    // ジャストプランが見つかった場合
                    if (dataUsage == selectedDataUsage) {
                        availablePlans.push({
                            carrier: carrierDisplayName,
                            planName: planName,
                            dataUsage: dataUsage,
                            price: price,
                            exactMatch: true
                        });
                        hasExactMatch = true;
                    }
                    // 40GB以上のプランを探す
                   else if (selectedDataUsage === "40以上" && dataUsage !== "無制限" && dataUsageValue >= 40 && !hasExactMatch) {
                        if (price < bestPrice) {
                            bestPrice = price;
                            bestPlan = { planName: planName, dataUsage: dataUsage };
                        }
                    }

                    // より大きいプランの中で最も安いものを探す
                    else if (dataUsage !== "無制限" && dataUsageValue > selectedDataUsageValue && !hasExactMatch) {
                        if (price < bestPrice) {
                            bestPrice = price;
                            bestPlan = { planName: planName, dataUsage: dataUsage };
                        }
                    }
                    // 無制限プランを候補に入れる（ジャストプランがない場合のみ）
                    else if (dataUsage === "無制限" && !hasExactMatch && selectedDataUsage !== "無制限") {
                         if (price < bestPrice) {
                            bestPrice = price;
                            bestPlan = { planName: planName, dataUsage: dataUsage };
                        }
                    }
                }

                // ベストプランを追加
                if (bestPlan) {
                    availablePlans.push({
                        carrier: carrierDisplayName,
                        planName: bestPlan.planName,
                        dataUsage: bestPlan.dataUsage,
                        price: bestPrice,
                        exactMatch: false
                    });
                }
                if(hasExactMatch == false && bestPlan == null){
                    availablePlans.push({
                            carrier: carrierDisplayName,
                            planName: "プランがありません",
                            dataUsage: "",
                            price: 0,
                            exactMatch: false
                        });
                }
            }
        }
        availablePlans = availablePlans.filter(plan => plan.planName != "プランがありません");
        if (availablePlans.length == 0) noResultsMessage.style.display = "block";

        // availablePlans を価格でソート
        availablePlans.sort((a, b) => a.price - b.price);

        // テーブルにプランを表示
        availablePlans.forEach(plan => {
            const row = document.createElement('tr');
            const carrierCell = document.createElement('td');
            carrierCell.textContent = plan.carrier;
            const planNameCell = document.createElement('td');
            // 無制限かどうかで表示を切り替える
           const dataUsageText = plan.dataUsage === "無制限" ? "(無制限)" : (selectedDataUsage === "40以上" && plan.dataUsage >= 40 ? `(${plan.dataUsage}GB)` : `(${plan.dataUsage}GB)`);
            planNameCell.textContent = `${plan.planName} ${dataUsageText}`;

            const priceCell = document.createElement('td');
            priceCell.textContent = plan.price + '円';
            row.appendChild(carrierCell);
            row.appendChild(planNameCell);
            row.appendChild(priceCell);
            planTableBody.appendChild(row);
        });
        
    }

    filterButton.addEventListener('click', function() {
        const selectedDataUsage = dataUsageSelect.value;
        const selectedCarriers = Array.from(carrierCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        displayPlans(selectedDataUsage, selectedCarriers);
    });

    // 初回表示時にキャリアのチェックボックスを並び替えて表示する
    updateCarrierCheckboxes();

    // Initial display (show all plans)
    const allCarriers = Array.from(carrierCheckboxes).map(checkbox => checkbox.value);
    displayPlans(dataUsageSelect.value, allCarriers);
});