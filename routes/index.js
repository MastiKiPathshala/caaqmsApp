var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CAQMS system' });
});

router.get('/:page', function(req, res, next) {
 
var managment = false,restart=false,upgrade = false,scan =false, sensors = false,edit = false,baseline = false,diag = false, stat = false, settings = false,dashboard = false,analytics=false;

switch(req.params.page){

	case 'dashboard.html':
	dashboard = true;
	break;

	case 'softwareupgrade.html':
	upgrade = true;
	managment = true;
	break;

	case 'baselining.html':
	baseline = true;
	sensors = true;
	break;

	case 'diagnostics.html':
	diag = true;
	managment = true;
	break;

	case 'editsensor.html':
	edit = true;
	sensors = true;
	break;


	case 'restart.html':
	restart = true;
	managment = true;
	break;

	case 'scan.html':
	scan = true;
	sensors = true;
	break;

	case 'settings.html':
	settings = true;
	managment = true;
	break;

	case 'statistics.html':
		stat = true;
		managment = true;
		break;

	case 'analytics.html':
		analytics = true;
		break;
}

res.locals = {
	managment:managment,restart:restart,upgrade:upgrade,scan :scan, sensors:sensors,edit:edit,baseline:baseline,diag:diag, stat:stat, settings:settings,dashboard:dashboard,analytics:analytics
};

	res.render(req.params.page, { title: 'Express',partials: {sidebar:'sidebar',head:'head'} });
});

module.exports = router;
