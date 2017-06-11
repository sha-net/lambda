console.log('Loading function');

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

exports.handler = function(event, context) {
    console.log("\n\nLoading handler\n\n");
    var ec2 = new AWS.EC2();
    var temp;
    params1 = {Resources: ['i-0c7bd637bcf807b89'], Tags: [
                {Key: 'Name', Value: 'roietest1'}
               ]};
   ec2.createTags(params1, function(err) {
                console.log("Tagging instance", err ? "failure" : "success");
                 });

    var with_owner = {};
    var without_tag = {};
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var timestamp = today.getTime() / 1000;

    Date.now = function() { return new Date().getTime(); }
    ec2.describeInstances({}, function(err, data) {
        if(err) {
            console.error(err.toString());
        } else {
            for(var r=0,rlen=data.Reservations.length; r<rlen; r++) {
                var reservation = data.Reservations[r];
                for(var i=0,ilen=reservation.Instances.length; i<ilen; ++i) {
                    var instance = reservation.Instances[i];

                    var name = '';
                    for(var t=0,tlen=instance.Tags.length; t<tlen; ++t) {
                        var ID = instance.InstanceId;
                        if(instance.Tags[t].Key === 'Lifetime') {
                            if (instance.Tags[t].Value !== '-1')
                            {
                                params = {};
                                params.Name = name;
                                params.Resource = ID;
                                params.Tags = "Lifetime","test";
                                params.State = instance.State.Name;
                                params.Lifetime = instance.Tags[t].Value;
                                console.log('Working on ' + ID)
                                //Define how many days to keep instance up will use this variable to recreate the instance
                                params.dayToKeep = instance.Tags[t].Value.split('+')[1]
                                if (params.dayToKeep === null)
                                {
                                    params.dayToKeep=0
                                }
                                temp = instance.Tags[t].Value.split('-')[1]
                                if (temp !== null)
                                {
                                    console.log('stopHour is ' + temp.slice(0,2));
                                    params.StopHour = temp.slice(0,2)
                                }
                                // Define start hour of instance
                                temp = instance.Tags[t].Value.split('-')[0]
                                if (temp !== null)
                                {
                                    console.log('startHour is ' + temp.substr(temp.length - 2));
                                    params.StartHour = temp.substr(temp.length - 2)
                                }

                                params.TimeZone = 0;
                                if (instance.Tags[t].Value.slice(0,2) === "IL")
                                {
                                   params.TimeZone = 3;
                                }
                                if (instance.Tags[t].Value.slice(0,2) === "US")
                                {
                                   params.TimeZone = 7;
                                }
                                var machineDateToStart = new Date(yyyy, mm, dd, params.StartHour, 0, 0);
                                console.log('machineDatetoStart ' + machineDateToStart);
                                params.timeStamptoStart = machineDateToStart.getTime() / 1000;
                                var machineDateToStop = new Date(yyyy, mm, dd, params.StopHour, 0, 0);
                                params.timeStamptoStop = machineDateToStop.getTime() / 1000;
                                instance.Tags[t].Value = "testbyroiey";
                                console.log('working on instance ' + ID);
                                console.log('instance state is ' + params.State);
                                console.log('instance start timestamp is ' + params.timeStamptoStart);
                                console.log('instance stop timestamp is ' + params.timeStamptoStop);
                                console.log('now timestamp is ' + timestamp);
                                if ((params.State === "stopped") && ( timestamp < params.timeStamptoStart ))
                                 {
                                console.log('Needs to start instance ' + ID)
                                }
                                if ((params.State === "running") && ( timestamp > params.timeStamptoStop ))
                                 {
                                console.log('Needs to start instance ' + ID)
                                }
                                modifyTag("i-0c7bd637bcf807b89","IL08-16+1")
                            }
                        } else {
                            params = {};
                            params.Name = name;
                            params.State = instance.State.Name;
                            without_tag[ID] = params;
                        }
                    }
                }
            }

        }
        function modifyTag(instanceID, newTag)
        {
              var AWS = require('aws-sdk');
              AWS.config.region = 'us-east-1';
              var ec2 = new AWS.EC2();
              console.log("start tagging on " + instanceID + "new tag is " + newTag);
              params1 = {Resources: [instanceID], Tags: [
                {Key: 'Lifetime', Value: newTag}
               ]};
              ec2.createTags(params1, function(err) {
                console.log("Tagging instance", err ? "failure" : "success");
                 });

        }
        console.log('WITH OWNER:')
        console.log(JSON.stringify(with_owner)+'\n\n')
        //console.log('WITHOUT OWNER:')
        //console.log(JSON.stringify(without_tag)+'\n\n')
        //context.done(null, 'Function Finished!');  
    });

};
