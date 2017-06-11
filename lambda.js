var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
exports.handler = function(event, context) {
    console.log("\n\nLoading handler\n\n");
    var ec2 = new AWS.EC2();
    ec2.describeRegions(function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
//          console.log(data);           // successful response
//          console.log(data.Regions.length)
          for(var rg=0,rgl=data.Regions.length;rg<rgl;++rg){
//            console.log("-----------"+data.Regions[rg].RegionName+"--------------");
            myregion = data.Regions[rg].RegionName;
            var ec2 =  new AWS.EC2({region: myregion});
            describe(ec2,myregion);
          }
        }
    });

  function describe(rec2,rgn){
    var with_project = {};
    var without_project = {};
    var EC2Objects = {};
    rec2.describeInstances({}, function(err, data) {
        if(err) {
            console.error(err.toString());
        } else {
            for(var r=0,rlen=data.Reservations.length; r<rlen; r++) {
                var reservation = data.Reservations[r];
                for(var i=0,ilen=reservation.Instances.length; i<ilen; ++i) {
                    var instance = reservation.Instances[i];
                    var name = '';
                    for(var t=0,tlen=instance.Tags.length; t<tlen; ++t) {
                        if(instance.Tags[t].Key === 'Name') {
                            name = instance.Tags[t].Value;
                        }
                        /*if(instance.Tags[t].Key === 'project') {
                            params = {};
                            params.Name = name;
                            params.State = instance.State.Name;
                            params.Project = instance.Tags[t].Value;
                            params.launchtime = instance.LaunchTime.toString();
                            var ID = instance.InstanceId;
                            var projetime = instance.LaunchTime.toString();
                            var projetime1 = new Date(instance.LaunchTime.toString()).getTime();
                            var projetime2 = Number(Math.floor(projetime1/1000));
                            var dateTime = new Date();
                            var timestamp = Number(Math.floor(dateTime / 1000));
                            var res = timestamp - projetime2;
                            params.uptimeinhours = res/3600;
                            if(params.uptimeinhours > 1){
                              params.stopme = true;
                            }else{
                              params.stopme = false;
                            }
                            with_project[ID] = params;
                        } else {*/
                        if(instance.Tags[t].Key != 'project') {
                            params = {};
                            params.Name = name;
                            params.State = instance.State.Name;
                            params.launchtime = instance.LaunchTime.toString();
                            params.Key = instance.KeyName;
                            var ID = instance.InstanceId;
                            var projetime = instance.LaunchTime.toString();
                            var projetime1 = new Date(instance.LaunchTime.toString()).getTime();
                            var projetime2 = Number(Math.floor(projetime1/1000));
                            var dateTime = new Date();
                            var timestamp = Number(Math.floor(dateTime / 1000));
                            var res = timestamp - projetime2;
                            params.uptimeinhours = res/3600;
                            if(params.uptimeinhours > 1){
                              params.stopme = true;
                              without_project[ID] = params;
                            }else{
                              params.stopme = false;
                            }
                        }
                    }
                }
            }
        }
        /*console.log(rgn+' WITH project:')
        console.log(JSON.stringify(with_project)+'\n\n')*/
        console.log(rgn+' WITHOUT project tag:');
        console.log(JSON.stringify(without_project)+'\n');
    });
  };
}
