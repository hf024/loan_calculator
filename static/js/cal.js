/**
 * Description:
 * Author: apple
 * Date: 2017/7/9.
 */
var cal = {
    getInterest: function () {
        "use strict";
        var interest_selector = document.getElementById('interest-selector');
        if (interest_selector !== null) {
            interest.value = interest_selector.value;
            interest.onchange();
        }
    },

    calType1: function () {
        "use strict";
        var objAmount = document.getElementById('amount');
        var objInterest = document.getElementById('interest');
        var objYears = document.getElementById('years');

        var principal = objAmount&&parseFloat(objAmount.value * 10000);
        var month_interest_rate = objInterest&&parseFloat(objInterest.value) / 100 / 12;
        var months = objYears&&parseFloat(objYears.value) * 12;

        //计算公式：
        // 每月还款金额= [贷款本金×月利率×（1+月利率）^还款月数]÷[（1+月利率）^还款月数－1]
        var x = Math.pow(1 + month_interest_rate, months);
        var monthly = (principal * x * month_interest_rate) / (x - 1);

        var total_interest = 0;
        var monthly_interest = 0;
        var payed_principal = 0;
        var total = 0;
        var html = '';
        var paymentArr = [];
        var principalArr = [];

        html += ' <caption>每月还款详情</caption> <tr><th>还款期数</th><th>还款额</th><th>本金</th><th>利息</th><th>剩余本金</th></tr>';


        if (isFinite(monthly)) {
            total = monthly * months;
            total_interest =(monthly * months) - principal;

            document.getElementById('payment').innerHTML = monthly.toFixed(2);
            document.getElementById('total').innerHTML = total.toFixed(2);
            document.getElementById('total-interest').innerHTML = total_interest.toFixed(2);

            for(var i = 0; i < months; i++){
                //每月利息=剩余本金x贷款月利率
                monthly_interest = (principal - payed_principal) * month_interest_rate;
                payed_principal += (monthly - monthly_interest);
                paymentArr[i] = monthly*(i+1);
                principalArr[i] = payed_principal;
                html += '<tr><td>'+parseInt(i+1)+'期</td><td>'+monthly.toFixed(2)+'</td><td>'+ (monthly - monthly_interest).toFixed(2)+'</td><td>'+parseFloat(monthly_interest).toFixed(2)+'</td><td>'+parseFloat(principal - payed_principal).toFixed(2)+'</td></tr>';
            }

            document.getElementById('detail-tbl').innerHTML = html;

            cal.save(objAmount.value, objInterest.value, objYears.value);

            try {
                cal.getLenders(objAmount.value, objInterest.value, objYears.value);
            } catch (e) {
                //ingore
            }

            cal.draw(principal, month_interest_rate, total, paymentArr, principalArr);

            return true;
        }else{
            return false;
        }
    },

    calType2: function(){
        "use strict";
        var objAmount = document.getElementById('amount');
        var objInterest = document.getElementById('interest');
        var objYears = document.getElementById('years');

        var principal = objAmount&&parseFloat(objAmount.value * 10000); //贷款本金
        var month_interest = objInterest&&parseFloat(objInterest.value) / 100 / 12; //月利率
        var months = objYears&&parseFloat(objYears.value) * 12; //还款月数
        var monthly = 0;
        var total = 0 ;
        var interest = 0;
        var html = '';

        var paymentArr = [];
        var principalArr = [];

        var month_principal = principal/months;
        //计算公式：
        //每月还款金额= （贷款本金/ 还款月数）+（本金 — 已归还本金累计额）×每月利率
        html += ' <caption>每月还款详情</caption> <tr><th>还款期数</th><th>还款额</th><th>本金</th><th>利息</th><th>剩余本金</th></tr>';
        for(var i = 0; i < months; i++){
            monthly = (principal/months) + (principal - i*month_principal) * month_interest;
            total += monthly;

            paymentArr[i] = total;
            principalArr[i] = month_principal*(i+1);

            html += '<tr><td>'+parseInt(i+1)+'期</td><td>'+monthly.toFixed(2)+'</td><td>'+month_principal.toFixed(2)+'</td><td>'+parseFloat(monthly-month_principal).toFixed(2)+'</td><td>'+parseFloat(principal-total).toFixed(2)+'</td></tr>';
        }

        interest = total - principal;

        if (isFinite(monthly)) {
            document.getElementById('payment').innerHTML = monthly.toFixed(2);
            document.getElementById('total').innerHTML = total.toFixed(2);
            document.getElementById('total-interest').innerHTML = interest.toFixed(2);
            document.getElementById('detail-tbl').innerHTML = html;
            cal.save(objAmount.value, objInterest.value, objYears.value);

            try {
                cal.getLenders(objAmount.value, objInterest.value, objYears.value);
            } catch (e) {
                //ingore
            }

            cal.draw(principal, month_interest, total, paymentArr,principalArr);

            return true;
        }else{
            return false;
        }


    },

    getPayType: function(){
        "use strict";
        var type = 0;

        var obj = document.getElementsByName('payment-type');
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].checked) {
                type = obj[i].value;
            }
        }

        type = parseInt(type);
        return type;
    },

    calculate: function () {
        var type = cal.getPayType();
        var result = false;

        if(type === 1) {
            result = cal.calType1();
        }else{
            result = cal.calType2();
        }

        if(result){

        }else{
            document.getElementById('payment').innerHTML = '';
            document.getElementById('total').innerHTML = '';
            document.getElementById('total-interest').innerHTML = '';
            cal.draw();
        }
    },

    save: function (amount, interest, years) {
        "use strict";
        if (window.localStorage) {
            localStorage.loan_amount = amount;
            localStorage.loan_interest = interest;
            localStorage.loan_years = years;
        }
    },

    getStorage: function () {
        "use strict";

        if (window.localStorage && localStorage.loan_amount) {
            var objAmount = document.getElementById('amount');
            var objInterest = document.getElementById('interest');
            var objYears = document.getElementById('years');

            objAmount.value = localStorage.loan_amount;
            objInterest.value = localStorage.loan_interest;
            objYears.value = localStorage.loan_years;
            cal.calculate();
        }
    },

    getLenders: function (amount, interest, years) {
        "use strict";
        if (!window.XMLHttpRequest) {
            return;
        }
        var ad = document.getElementById('lenders');

        if (!ad) {
            return;
        }

        var url = 'http://127.0.0.1:8002/getbank?amt=' + encodeURIComponent(amount) + '&apr=' + encodeURIComponent(interest) + '&yrs=' + encodeURIComponent(years);
        //var url
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.send(null);
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                var res = req.responseText;
                var lenders = JSON.parse(res);
                var list = '';
                if(lenders.data){
                    for (var i = 0; i < lenders.data.length; i++) {
                        list += '<li><a target="_blank" href="' + lenders.data[i].url + '">' + lenders.data[i].name + '</a>';
                    }
                    ad.innerHTML = list;
                }
            }
        }
    },

    draw: function (principal, interest, totalPay, paymentArr, pricipalArr) {
        "use strict";
        var graph = document.getElementById('graph');
        graph.width = graph.width; //清除画布的一种技巧

        if (arguments.length === 0 || !graph.getContext) {
            return;
        }

        //获取画布元素的context对象，这个对象地应了一组绘画API
        var g = graph.getContext('2d');

        //获取画布的宽和高
        var width = graph.width;
        var height = graph.height;
        
        //X: 月
        function monthToX(m) {
            return m  * width / months;
        }

        //Y: 支出
        function amountToY(a) {
            return  height - (a/totalPay)* (height - 20);
        }

        var months = paymentArr.length;

        //绘制总支出
        g.moveTo(monthToX(0), amountToY(0)); //从左下方开始
        for(var i = 0; i < months; i++){
            g.lineTo(monthToX(i+1), amountToY(paymentArr[i])) ; //绘至右上方
        }

        g.lineTo(monthToX(months), amountToY(0)); //再至右下方
        g.closePath();//将结尾连至开头

        g.fillStyle = '#f88';
        g.fill(); //填充当前绘图路径
        
        g.font = 'bold 16px 微软雅黑 sans-serif';
        g.fillText('总支出', 10, 20);

        //绘制本金支出
        // var equity = 0;
        // g.beginPath(); //开始绘制新的图形
        // g.moveTo(monthToX(0), amountToY(0));
        //
        // for (var p = 0; p < months; p++) {
        //     g.lineTo(monthToX(p), amountToY(pricipalArr[p]));
        // }
        // g.lineTo(monthToX(months), amountToY(0));
        // g.closePath();
        // g.fillStyle = 'green';
        // g.fill();
        // g.fillText('本金', 20, 35);

        //绘制利息支出
        var interest = 0;
        g.beginPath();
        g.moveTo(monthToX(0),amountToY(0));
        for(var m = 0 ; m  < months; m++){
            interest = paymentArr[m] -  pricipalArr[m];
            g.lineTo(monthToX(m), amountToY(interest));
        }
        g.lineTo(monthToX(months), amountToY(0));
        g.closePath();
        g.fillStyle = 'blue';
        g.fill();
        g.fillText('利息支出',10, 45);

        //绘制剩余本金
        var bal = principal;
        g.beginPath();
        g.moveTo(monthToX(0), amountToY(bal));
        for (var p = 0; p < months; p++) {
            bal = principal - pricipalArr[p];
            g.lineTo(monthToX(p), amountToY(bal));
        }

        g.lineWidth = 3;
        g.stroke();
        g.fillStyle = "black";
        g.fillText('剩余本金', 10, 70);


        //标记X轴
        g.textAlign = 'center';
        var y = amountToY(0);
        for (var year = 1; year * 12 <= months; year++) {
            var x = monthToX(year * 12);
            g.fillRect(x - 0.5, y - 3, 1, 3);
            if (year === 1) {
                g.fillText('year', x, y - 5);
            }

            if (year % 5 === 0 && year * 12 !== months) {
                g.fillText(String(year), x, y - 5);
            }
        }

        //将支付数额标记在右边界
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        var ticks = [totalPay, totalPay-principal];
        var rightEdge = monthToX(months);
        for (var i = 0; i < ticks.length; i++) {
            var y = amountToY(ticks[i]);
            g.fillRect(rightEdge - 3, y - 0.5, 3, 1);
            g.fillText(String(ticks[i].toFixed(0)), rightEdge - 5, y);
        }

        //将剩余本金数额标记在左边界上
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        var leftEdege = monthToX(0);
        var y = amountToY(principal);
        g.fillRect(leftEdege + 3, y - 0.5, 3,1);
        g.fillText(String(principal.toFixed(0)), leftEdege + 5, y-5);
    }
};