//EC6 TODO classes
calculaDiferenca = function(horaA, horaB) {
    var momentA = criaMoment(horaA);
    var momentB = criaMoment(horaB);

    return momentA.diff(momentB, 'second', true);
};

function PontoBase() {
    this.diaBase = "2011-01-01 ";
    this.jornadaExtra = "08:58";
    this.jornadaNormal = "08:48";
    this.jornadaMinima = "08:38";
    this.horasTrabalhadas = {};

    this.setHorasTrabalhadas = function(horas) {
        this.horasTrabalhadas = moment(this.diaBase + horas);
    };

}

function PontoSaldo() {
    this.calculaSaldoHHMMSS = function(diaUtil) {
        var day = moment(this.diaBase);
        if(diaUtil) 
            return day.add(calculaDiferenca(this.horasTrabalhadas.format("HH:mm"),  this.jornadaNormal), "second").format("HH:mm");

        return this.horasTrabalhadas.format("HH:mm");
    };

    this.calculaSaldoNegativoHHMMSS = function() {
        var day = moment(this.diaBase);
        return day.subtract(calculaDiferenca(this.horasTrabalhadas.format("HH:mm"),  this.jornadaNormal), "second").format("HH:mm");
    };

    this.calculaSaldo = function() {
        return calculaDiferenca(this.horasTrabalhadas.format("HH:mm"),  this.jornadaNormal);
    };

    this.isHoraExtra = function() {
        return !this.horasTrabalhadas.isBefore(this.diaBase + this.jornadaExtra, 'time');
    };

    this.isJornadaAbaixo = function () {
        return this.horasTrabalhadas.isBefore(this.diaBase + this.jornadaMinima, 'time');
    };

}

PontoSaldo.prototype = new PontoBase();

function PontoHoje(p1, p2, p3, p4, p5, p6) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.p4 = p4;
    this.p5 = p5;
    this.p6 = p6;
    this.jornadaMinimaTotalSegundos = 31680;
    this.existePrevisao = false;
    this.periodoTrabalhadoManha = "";

    this.timeNow = function() {
        return moment().format("HH:mm");
    };

    this.periodoTrabalhado = function() {
        if(this.isTerceiroPeriodo() && this.p6 != "")
            return calculaDiferenca(this.p2, this.p1) + calculaDiferenca(this.p4, this.p3) + calculaDiferenca(p6, p5);
        else if (this.isTerceiroPeriodo() && this.p6 == "") {
            this.existePrevisao = true;
            this.periodoTrabalhadoManha = calculaDiferenca(this.p2, this.p1) + calculaDiferenca(this.p4, this.p3);

            return this.periodoTrabalhadoManha + calculaDiferenca(this.timeNow(), this.p5);
        }

        if(this.isSegundoPeriodo() && this.p4 != "")
            return calculaDiferenca(this.p2, this.p1) + calculaDiferenca(this.p4, this.p3);
        else if(this.isSegundoPeriodo() & this.p4 == "") {
            this.existePrevisao = true;
            this.periodoTrabalhadoManha = calculaDiferenca(this.p2, this.p1);
            return this.periodoTrabalhadoManha + calculaDiferenca(this.timeNow(), this.p3);
        }

        if(this.p1 != "" && this.p2 != "")
            return calculaDiferenca(this.p2, this.p1);
        else 
            return calculaDiferenca(this.timeNow(), this.p1);
    };

    this.horaAtualTrabalhadas = function() {
        return moment(this.diaBase).add(this.periodoTrabalhado(), "second");
    };

    this.porcentagem_horaAtualTrabalhadas = function() {
        return this.periodoTrabalhado() * 100 / this.jornadaMinimaTotalSegundos;
    };

    this.isTerceiroPeriodo = function() {
        return this.p5 != "" && this.p4 != "" && this.p3 != "";
    };

    this.isSegundoPeriodo = function() {
        return this.p1 != "" && this.p2 != "" && this.p3 != "" && this.p5 == "" && this.p6 == "";
    };

    this.ultimoPonto = function() {
        if(this.isTerceiroPeriodo())
            return this.p5;

        return this.p3;
    };

    this.horaSaida = function() {
        return criaMoment(this.ultimoPonto()).add(pontoHoje.jornadaMinimaTotalSegundos - pontoHoje.periodoTrabalhadoManha, "second");
    };

}

PontoHoje.prototype = new PontoBase();

function PontoConferencia() {
    this.relatorio = "";
    this.REL_CONFERENCIA_HORAS = "REL_CONFERENCIA_HORAS";
    this.tempoParaAjuste = "03:00";

    this.setRelatorio = function() {
        this.relatorio = this.REL_CONFERENCIA_HORAS;
    };

    this.isRelatorioConferenciaTask = function() {
        return this.relatorio == this.REL_CONFERENCIA_HORAS;
    };

    this.isAjustavel = function(diferenca) {
        return criaMoment(diferenca.replace("-","")).isAfter(this.diaBase + this.tempoParaAjuste, 'time'); 
    };
}

PontoConferencia.prototype = new PontoBase();


criaMoment = function(hora) {
    return moment('2011-01-01 ' + hora);
};

// gambeta para carregar css
var cssId = 'myCss';
if (!document.getElementById(cssId))
{
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.min.css';
    link.media = 'all';
    head.appendChild(link);
}


$(".td_horas_trabalhadas").each(function(index) {
    isDiaUtil = function(elemento) {
        //TODO
        return true;
        //return elemento.parent().children().first().text().indexOf("Sab.") < 0 && elemento.parent().children().first().text().indexOf("Dom.") < 0;
    };

    var jornada = new PontoSaldo();
    jornada.setHorasTrabalhadas($(this)[0].innerText);

    console.info(jornada.horasTrabalhadas)
    console.info(jornada.isHoraExtra())

    if((jornada.horasTrabalhadas.isValid() && jornada.isHoraExtra() || (!isDiaUtil($(this)) && jornada.horasTrabalhadas.isAfter(jornada.diaBase + '00:00', 'time')))){
        console.info("gotcha!" + $(this).text());
        $(this).append("&nbsp;<span class=\"label label-warning\" style=\"font-size:9px\" title=\"Hora extra\">+"+ jornada.calculaSaldoHHMMSS(isDiaUtil($(this))) + "</span>");
    }
    else if(jornada.horasTrabalhadas.isValid() && jornada.isJornadaAbaixo() && !jornada.horasTrabalhadas.isSame(jornada.diaBase + '00:00', 'time')) {
        console.info("gotcha!" + $(this).text());
        $(this).append("&nbsp;<span class=\"label label-danger\" style=\"font-size:9px\" title=\"Jornada abaixo\">-" + jornada.calculaSaldoNegativoHHMMSS() + "</span>");
    }
    else if(jornada.horasTrabalhadas.isSame(jornada.diaBase + '00:00:00', 'time')) {
        console.info("gotcha!" + $(this).text());
        $(this).parent().addClass("info");
    }
});

var today = $(".tabela_ponto tbody tr td a[dp=\"" + moment().format("DD/MM/YYYY") +"\"]").parent();

var p1 = today.children().eq(1).text();
var p2 = today.children().eq(2).text();
var p3 = today.children().eq(3).text();
var p4 = "";
var p5 = "";
var p6 = "";

pontoHoje = new PontoHoje(p1, p2, p3, p4, p5, p6);

if(pontoHoje.p1 != "") {

    function PontoBoxBuilder(pontoHoje) {
        this.box = "";

        this.getBox = function() {
            return this.box;
        };

        this.montaProgress = function() {
            var tempoString = pontoHoje.horaAtualTrabalhadas().isBefore(pontoHoje.diaBase + "01:00", 'time') ? "minutos": "horas";
            return "<h2>Voc&ecirc; j&aacute; cumpriu <strong><span id=\"horarioCumprido\">"+ pontoHoje.horaAtualTrabalhadas().format("HH:mm") +"</span></strong> "+ tempoString + "</h2>" +
                "<div class=\"progress\">" +
                    "<div id=\"progress-bar\" class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"45\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+ pontoHoje.porcentagem_horaAtualTrabalhadas() + "%\">" +
                    parseInt(pontoHoje.porcentagem_horaAtualTrabalhadas()) +"%" +
                    "</div>" +
                "</div>";
        };

        this.montaPrevisaoHorarios = function() {
            if(pontoHoje.existePrevisao) {
                return "<h4>Jornada:</h4>\n" +
                    "<h4><span class=\"label label-success\" title=\"Hor&aacute;rio m&iacute;nimo para sa&iacute;da, com toler&acirc;ncia de -10 minutos totalizando 8 horas e 38 minutos.\">M&iacute;nima: " + pontoHoje.horaSaida().subtract(10, 'minutes').format("HH:mm") + "</span>\n" +
                    "<span class=\"label label-primary\" title=\"Hor&aacute;rio normal de sa&iacute;da, totalizando a jornada de 8 horas e 48 minutos.\">Normal: " + pontoHoje.horaSaida().format("HH:mm") + "</span>\n" +
                    "<span class=\"label label-warning\" title=\"Hor&aacute;rio para começar a contabilizar hora extra, +8 horas e 58 minutos.\">Extra: " + pontoHoje.horaSaida().add(10, 'minutes').format("HH:mm") + "</span> </h4>\n";
            } else {
                return "<h4>Jornada:</h4>\n<h4>" +
                    "<span style=\"font-size:35px\" class=\"label-inverse glyphicon glyphicon-exclamation-sign\" title=\"Sem previs&atilde;o para o estado atual.\"></span>" +
                    "</h4>\n";
            }
        };

        this.build = function() {
            this.box =
                "<div align=\"center\">" +
                    "<div class=\"btn btn-default pull-right glyphicon glyphicon-refresh\" onClick=\"refreshBox()\"></div>" +
                    "<div class=\"well well-lg\">" +
                        this.montaProgress() +
                        "\n" +
                        this.montaPrevisaoHorarios() +
                    "</div>" +
                "</div>";

            return this;
        };
    }

    pontoBox = new PontoBoxBuilder(pontoHoje).build();

    refreshBox = function() {
        $("#horarioCumprido").text(pontoHoje.horaAtualTrabalhadas().format("HH:mm"));

        var porcentagem = pontoHoje.porcentagem_horaAtualTrabalhadas();
        $("#progress-bar").css("width", porcentagem + "%").text(parseInt(porcentagem) +"%");
    };

    if (pontoHoje.horaSaida().isValid()) {
        $("#content").parent().append(
            pontoBox.getBox()
        );
    }

    //TODO fazer um método/modal 
    localStorage.setItem("minimumNotification", "S");
    var notified = false;
    if(localStorage.getItem("minimumNotification") != null && localStorage.getItem("minimumNotification") != "" && localStorage.getItem("minimumNotification") == "S") {
        var countdownLoop = setInterval(function () {
            if(notified)
                clearInterval(countdownLoop);
            else {
                if (Notification.permission === "granted" && pontoHoje.existePrevisao && criaMoment(moment().format("HH:mm")).isAfter(pontoHoje.horaSaida().subtract(10, 'minutes'))) {
                    createNotification("mínima", pontoHoje.horaSaida().subtract(10, 'minutes').format("HH:mm"));
                    notified = true;
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission(function (permission) {
                        if (permission === "granted" && pontoHoje.existePrevisao && criaMoment(moment().format("HH:mm")).isAfter(pontoHoje.horaSaida().subtract(10, 'minutes')))  {
                            createNotification("mínima", pontoHoje.horaSaida().subtract(10, 'minutes').format("HH:mm"));
                            notified = true;    
                        }
                    });
                }
            }
        }, 10000);
    }

    function createNotification(label, horario) {
        var options = {
            body:  moment().format("DD/MM/YYYY") + " - " + horario,
            icon: 'http://www.db1.com.br/assets/images/logo.png'
        }

        return new Notification("Jornada "+ label +" cumprida!", options);
    }

}

 

