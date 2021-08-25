class HUD extends Component {

    static init() {

        HUD.canvas = document.querySelector('canvas');
        HUD.ctx = HUD.canvas.getContext('2d');
        HUD.ctx.imageSmoothingEnabled = false;

        HUD.scoresBackgroundImage = Resources.getImage('hud_score_bckgrd');

        HUD.walletONIcon = Resources.getImage('icons_wallet_on').imageData;
        HUD.walletOFFIcon = Resources.getImage('icons_wallet_off').imageData;

        HUD.gunONIcon = Resources.getImage('icons_gun_on').imageData;
        HUD.gunOFFIcon = Resources.getImage('icons_gun_off').imageData;

        HUD.hiScorewsX = 0;
        HUD.isEnabled = true;
    }

    static drawHiScores() {

        const yPos = HUD.canvas.height - 35;
        const xPos = HUD.canvas.width - HUD.hiScorewsX;

        HUD.ctx.drawImage(HUD.scoresBackgroundImage.imageData, 0, yPos, HUD.canvas.width, 10);

        const text = `${Resources.labelsData.HISCORE} = ${Resources.HIGH_SCORE}`;
        let textMesaure = HUD.ctx.measureText(text);
        HUD.ctx.fillStyle = '#bdbdbd';
        HUD.ctx.fillRect(xPos, yPos, textMesaure.width, 10);
        HUD.ctx.fillStyle = '#000000';
        HUD.ctx.fillRect(xPos - 10, yPos, 10, 10);
        HUD.ctx.fillText(text, xPos, yPos + 8);
        HUD.ctx.fillRect(xPos + textMesaure.width, yPos, 10, 10);
        HUD.ctx.fillStyle = '#ffffff';

        HUD.hiScorewsX += 3;

        if (HUD.hiScorewsX > HUD.canvas.width + (textMesaure.width + 20)) HUD.hiScorewsX = 0;
    }

    static drawExpense(expense) {
        const expenseTxt = `${Resources.labelsData.EXPENSE}=${expense}$`;
        const text = HUD.ctx.measureText(expenseTxt);
        HUD.ctx.fillText(expenseTxt, (HUD.canvas.width - text.width), (HUD.canvas.height - 35));
    }

    static update(data) {

        if (!HUD.isEnabled) return;

        if (HUD.hiScoresEnabled) HUD.drawHiScores();
        else HUD.hiScorewsX = 0;

        if (data.expense !== null) HUD.drawExpense(data.expense);

        HUD.ctx.font = '20px Mono';

        let yPosA = (HUD.canvas.height - 16);
        let yPosB = (HUD.canvas.height) - 3;

        const pointsTxt = `${Resources.labelsData.POINTS}=${data.points}`;
        let text = HUD.ctx.measureText(pointsTxt);
        HUD.ctx.fillText(pointsTxt, 0, yPosA);

        const cashTxt = `${Resources.labelsData.CASH}=${data.cash}$`;
        text = HUD.ctx.measureText(cashTxt);
        HUD.ctx.fillText(cashTxt, (HUD.canvas.width - text.width), yPosA);
        HUD.ctx.fillText(`${Resources.labelsData.DRUGS}=${data.drugs}`, 0, yPosB);

        if (data.wallet) HUD.ctx.drawImage(this.walletONIcon, 0, 0, HUD.canvas.width, HUD.canvas.height + 2);
        else HUD.ctx.drawImage(this.walletOFFIcon, 0, 0, HUD.canvas.width, HUD.canvas.height + 2);


        if (data.gun) HUD.ctx.drawImage(this.gunONIcon, 0, 0, HUD.canvas.width, HUD.canvas.height + 2);
        else HUD.ctx.drawImage(this.gunOFFIcon, 0, 0, HUD.canvas.width, HUD.canvas.height + 2);
    }
}

HUD.NAME = 'hud';
HUD.ctx = null;
HUD.canvas = null;
HUD.scoresBackgroundImage = null;
HUD.walletONIcon = null;
HUD.walletOFFIcon = null;
HUD.gunONIcon = null;
HUD.gunOFFIcon = null;
HUD.hiScoresEnabled = true;

HUD.hiScorewsX = 0;
