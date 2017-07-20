var app = angular.module("sc",["ngRoute"]);

app.config(function($routeProvider) {
  $routeProvider
  .when("/createArtifacts", {
    templateUrl : "./views/createArtifacts.html",
    controller : "artifactsCtrl"
  })
  .when("/register", {
    templateUrl : "./views/register.html",
    controller : "registerCtrl"
  })
  .when("/getDetails", {
    templateUrl : "./views/getDetails.html",
    controller : "getDetailsCtrl"
  })
});

app.controller("indexCtrl",function($scope,$http,$rootScope,$filter){
	$scope.formData = {}
	$scope.getStudentDetails = true;
	$scope.addEducationList = false;
	$scope.tempStudentId= 1;
	$scope.studentDetails={}
	$scope.chvr;
	$scope.chid;
	$scope.getById ={};
	$scope.addOnlyEdu=false
	$scope.noData = false
	$scope.res = new Date();
	$rootScope.date = $filter('date')($scope.res, 'yyyy-MM-dd');
	$scope.fileInfo=[];
	$scope.enroll = function(){
		$http.post('/users',$scope.formData).success(function(res){
			if(res.success==false){
				alert("Sorry Login failed :(  Try again")
				$rootScope.enrolled= false;
			}else{
				$scope.enrollRes = res;
				$rootScope.enrolled= true;
				$rootScope.orgToken = res.token;
				$scope.channelCreted=true;
				$rootScope.userName=$scope.formData.username.toUpperCase();
				$rootScope.orgName=$scope.formData.orgName;
				$scope.formData = {}
				console.log("response",res);
			}	
		}).error(function(error){
			console.log(error);		
		});
	}
	
	
});


app.controller("registerCtrl",function($scope,$http,$rootScope){
	$scope.reqData={};
	$scope.showFiles = function(){
		angular.element('#file').click();
	}
	$scope.studentDetails= {}
	$scope.showRegistration=false;
	$scope.addOnlyEdu=false;
	$scope.showRegForm = function(){
		$scope.showRegistration=true
		$scope.addOnlyEdu=false	
		peers()
	}
	$scope.showAEForm = function(){
		$scope.showRegistration=false
		$scope.addOnlyEdu=true	
		peers()
	}
	function fileextention(filename){
	    var a =filename.split(".");
			if( a.length === 1 || ( a[0] === "" && a.length === 2 ) )
			{
			 return "";
			}
			console.log(a);
			return a.pop();
		}
	$scope.profilePic = function(dpFile){
		$scope.fileInfo=[];
		var file = document.getElementById(dpFile).files;
		console.log("fil..........",file)
		for(var i=0;i<file.length;i++){
			var reader = new FileReader();
			var ext= fileextention(file[i].name);
			console.log(ext)
			if(ext != "jpg" && ext != "jpeg" && ext != "png"){
				angular.element("input[type='file']").val(null);
			}

			/*console.log("file..........",file)
			 
			  //To check File Size
			var isLessThan1Mb = ( file[i].size / 1024 / 1024 ) <= 1 ? true : false;

			if( !isLessThan1Mb ){
			   var showfileTypeAlert=true;
			}*/
			else{
				$scope.fileInfo.push({"name": file[i].name, "size":file[i].size});
				console.log("files info..........",$scope.fileInfo[0].name);
				reader.onloadend = function(e){

					$scope.profilePicture = e.target.result;

				}
				reader.readAsDataURL(file[i]); //converts the file to base64string
				 // });
			} 
		}
	}
	$scope.peers={}
	$scope.peerToJoin=[]
	function peers(){
		if($rootScope.orgName =="org1"){
			$scope.peers = {"peer0":"localhost:7051","peer1":"localhost:7056"}
			console.log($scope.peers)
		}
		else if($rootScope.orgName == "org2"){
			$scope.peers = {"peer2":"localhost:8051","peer3":"localhost:8056"}
			console.log($scope.peers)
		}
	}
	$scope.isChecked =false;
	$scope.selectedPeers = function(peer,index){
		var count = 0
		for(var i=0;i<$scope.peerToJoin.length;i++){
			if($scope.peerToJoin[i]===peer){
				$scope.peerToJoin.splice(i,1)
				count = 1
			}
		}
		if(count==0){
			$scope.peerToJoin.push(peer)
		}
		console.log($scope.peerToJoin)
	}
	$scope.registerStudent = function(){
		if($scope.reqData.channelName == undefined){
			$scope.reqData.channelName="mychannel";
		}
		if ($scope.studentDetails.studentDegree != null || $scope.studentDetails.studentDegree !=undefined){
			if($scope.profilePicture == undefined){
				$scope.profilePicture = ""
			}
			if($scope.peerToJoin.length>0 && $scope.reqData.chaincodeName!=undefined&& $scope.reqData.chaincodeVersion!=undefined){
				var reqData = {}
				reqData.peers=[];
				for(var i=0;i<$scope.peerToJoin.length;i++){
					reqData.peers[i]=$scope.peerToJoin[i]
				}
				reqData.chaincodeVersion = $scope.reqData.chaincodeVersion
				reqData.functionName = "register"
				reqData.args= [$scope.studentDetails.studentId,$scope.profilePicture,$scope.studentDetails.studentName,$scope.studentDetails.studentDOB,$scope.studentDetails.studentGender,$rootScope.userName,$rootScope.date,$scope.studentDetails.studentDegree,$scope.studentDetails.studentBoard,$scope.studentDetails.studentInstitute,$scope.studentDetails.studentPassedOut,$scope.studentDetails.studentScore,$rootScope.userName,$rootScope.date];
				console.log("reqData",reqData)
				$http({
				    method: 'POST',
				    url: '/channels/'+$scope.reqData.channelName+'/chaincodes/'+$scope.reqData.chaincodeName+'',
				    headers: {
					"authorization": "Bearer "+$rootScope.orgToken+"",
					"content-Type": "application/json",
					"x-access-token":""+$rootScope.orgToken+""
				    },
				    data: reqData
				}).success(function(res){
					console.log("student Registration Chaincode success response",res);
					$scope.studentDetails= {}
				}).error(function(error){
					console.log(error);
				});
			}else{
				alert("select atleast one peer")
			}	
		}
		else{
			if($scope.peerToJoin.length>0 && $scope.reqData.chaincodeName!=undefined&& $scope.reqData.chaincodeVersion!=undefined){
				var reqData = {}
					reqData.peers=[];
					for(var i=0;i<$scope.peerToJoin.length;i++){
						reqData.peers[i]=$scope.peerToJoin[i]
					}
					reqData.chaincodeVersion = $scope.reqData.chaincodeVersion 
					reqData.functionName = "register"
					reqData.args= [$scope.studentDetails.studentId,$scope.profilePicture,$scope.studentDetails.studentName,$scope.studentDetails.studentDOB,$scope.studentDetails.studentGender,$rootScope.userName,$rootScope.date];
				console.log("reqData",reqData)
				$http({
				    method: 'POST',
				    url: '/channels/'+reqData.channelName+'/chaincodes/'+$scope.reqData.chaincodeName+'',
				    headers: {
					"authorization": "Bearer "+$rootScope.orgToken+"",
					"content-Type": "application/json",
					"x-access-token":""+$rootScope.orgToken+""
				    },
				    data: reqData
				}).success(function(res){
					console.log("student Registration Chaincode success response",res);
					$scope.tempStudentId++;
				}).error(function(error){
					console.log(error);
				});
			}else{
				alert("select atleast one peer")
			}	
		}	
	}
	$scope.addEducation = function(){
		$scope.addEducationList = !$scope.addEducationList;	
	}
	$scope.appendEducation = function(){
		if($scope.reqData.channelName == undefined){
			$scope.reqData.channelName="mychannel";
		}
		if($scope.peerToJoin.length>0 && $scope.reqData.chaincodeName!=undefined&& $scope.reqData.chaincodeVersion!=undefined){
			var reqData = {}
			reqData.peers=[];
			for(var i=0;i<$scope.peerToJoin.length;i++){
				reqData.peers[i]=$scope.peerToJoin[i]
			}
			reqData.chaincodeVersion = $scope.reqData.chaincodeVersion 
			reqData.functionName = "addEducation"
			reqData.args= [$scope.studentDetails.studentId,$scope.studentDetails.studentDegree,$scope.studentDetails.studentBoard,$scope.studentDetails.studentInstitute,$scope.studentDetails.studentPassedOut,$scope.studentDetails.studentScore,$rootScope.userName,$rootScope.date];
			console.log("reqData",reqData)
			
			$http({
			    method: 'POST',
			    url: '/channels/'+$scope.reqData.channelName+'/chaincodes/'+$scope.reqData.chaincodeName+'',
			    headers: {
				"authorization": "Bearer "+$rootScope.orgToken+"",
				"content-Type": "application/json",
				"x-access-token":""+$rootScope.orgToken+""
			    },
			    data:reqData
			}).success(function(res){
				console.log("Adding Education to student Chaincode success response",res);
			}).error(function(error){
				console.log(error);
			});
		}else{
			alert("select atleast one peer")
		}		
		
	}
})
app.controller("artifactsCtrl",function($scope,$http,$rootScope){
	//$scope.peers = {"peer0":"localhost:7051","peer1":"localhost:7056","peer2":"localhost:8051","peer3":"localhost:8056"};

	$scope.formData = {}
	$scope.channelName = [];
	$scope.peerToJoin =[];
	$scope.formData.channelConfigPath="../artifacts/channel/mychannel.tx"
	$scope.formNumber=[true,false,false,false,false]
	function peers(){
		if($rootScope.orgName =="org1"){
			$scope.peers = {"peer0":"localhost:7051","peer1":"localhost:7056"}
			console.log($scope.peers)
		}
		else if($rootScope.orgName == "org2"){
			$scope.peers = {"peer2":"localhost:8051","peer3":"localhost:8056"}
			console.log($scope.peers)
		}
	}
	$scope.displayForm = function(index){
		$scope.formNumber=[false,false,false,false,false];
		$scope.formNumber[index]=true;
		$scope.peerToJoin = [];
		if($scope.peers==undefined){
			peers()
		}	
	}
	$scope.isChecked =false;
	$scope.selectedPeers = function(peer,index){
		var count = 0
		for(var i=0;i<$scope.peerToJoin.length;i++){
			if($scope.peerToJoin[i]===peer){
				$scope.peerToJoin.splice(i,1)
				count = 1
			}
		}
		if(count==0){
			$scope.peerToJoin.push(peer)
		}
		console.log($scope.peerToJoin)
	}
	$scope.createChannel = function(){
		//$scope.formData.channelConfigPath="../artifacts/channel/mychannel.tx"
		alert($scope.formData.channelConfigPath)
		if($rootScope.userName !=undefined || $rootScope.userName != ""){
			$http({
			    method: 'POST',
			    url: '/channels',
			    headers: {
				"authorization": "Bearer "+$rootScope.orgToken+"",
				"content-Type": "application/json",
				"x-access-token":""+$rootScope.orgToken+""
			    },
			    data: $scope.formData
			}).success(function(res){
				console.log("Create channel response",res);
				$scope.channelName[$scope.channelName.length]=$scope.formData.channelName;
				$scope.formData = {}
			}).error(function(error){
				$scope.channelName[$scope.channelName.length]=$scope.formData.channelName;
				$scope.formData = {}
				console.log(error);		
			});
		}
	}

	$scope.joinChannel= function(){
		if($scope.formData.joinChannelName == undefined){
			$scope.formData.joinChannelName ="mychannel";
		}
		alert($scope.formData.joinChannelName)
		if($rootScope.userName !=undefined || $rootScope.userName != ""){
			if($scope.peerToJoin.length>0){
				var reqData ={};
				reqData.peers=[];
				for(var i=0;i<$scope.peerToJoin.length;i++){
					reqData.peers[i]=$scope.peerToJoin[i]
				}
				console.log(reqData)
				$http({
				    method: 'POST',
				    url: '/channels/'+$scope.formData.joinChannelName+'/peers',
				    headers: {
					"authorization": "Bearer "+$rootScope.orgToken+"",
					"content-Type": "application/json",
					"x-access-token":""+$rootScope.orgToken+""
				    },
				    data: reqData
				}).success(function(res){
					console.log("Join Channel response",res);
					$scope.formData = {}
				}).error(function(error){
					$scope.formData = {}
					console.log(error);		
				});
			}
			else{
				alert("select atleast one peer")
			}
		}
	}
	$scope.getPeers= function(){
		if($scope.formData.joinChannelName == undefined){
			$scope.formData.joinChannelName ="mychannel2";
		}
		if($rootScope.userName !=undefined || $rootScope.userName != ""){
			$http({
			    method: 'POST',
			    url: '/channels/'+$scope.formData.joinChannelName+'',
			    headers: {
				"authorization": "Bearer "+$rootScope.orgToken+"",
				"content-Type": "application/json",
				"x-access-token":""+$rootScope.orgToken+""
			    },
			    data: '{}'
			}).success(function(res){
				console.log("Peers in the channel",res);
				$scope.formData = {}
			}).error(function(error){
				$scope.formData = {}
				console.log(error);		
			});
		}
	}
	
	$scope.installChaincode= function(){
		$scope.formData.chainPath = "github.com/chaincodes"
		if($rootScope.userName !=undefined || $rootScope.userName != ""){
			if($scope.peerToJoin.length>0){

				var reqData = {}
				reqData.peers=[];
				for(var i=0;i<$scope.peerToJoin.length;i++){
					reqData.peers[i]=$scope.peerToJoin[i]
				}
				reqData.chaincodeName = $scope.formData.chainName
				reqData.chaincodePath = $scope.formData.chainPath
				reqData.chaincodeVersion = $scope.formData.chainVersion;

				$http({
				    method: 'POST',
				    url: '/chaincodes',
				    headers: {
					"authorization": "Bearer "+$rootScope.orgToken+"",
					"content-Type": "application/json",
					"x-access-token":""+$rootScope.orgToken+""
				    },
				    data: reqData
				}).success(function(res){
					console.log("install Chaincode response",res);
					$scope.formData = {}
				}).error(function(error){
					console.log(error);
					$scope.formData = {}		
				});
			}
			else{
				alert("select atleast one peer")
			}
		}
	}

	$scope.instantiateChaincode= function(){
		$scope.formData.chainPath = "github.com/chaincodes"
		if($scope.formData.joinChannelName == undefined){
			$scope.formData.joinChannelName ="mychannel";
		}
		if($rootScope.userName !=undefined || $rootScope.userName != ""){
			if($scope.peerToJoin.length>0){
				var reqData = {}
				reqData.peers=[];
				for(var i=0;i<$scope.peerToJoin.length;i++){
					reqData.peers[i]=$scope.peerToJoin[i]
				}
				reqData.chaincodeName = $scope.formData.chainName
				reqData.chaincodePath = $scope.formData.chainPath
				reqData.chaincodeVersion = $scope.formData.chainVersion;
				reqData.functionName = "init"
				reqData.args= ["init"];
				$http({
				    method: 'POST',
				    url: 'channels/'+$scope.formData.joinChannelName+'/chaincodes/',
				    headers: {
					"authorization": "Bearer "+$rootScope.orgToken+"",
					"content-Type": "application/json",
					"x-access-token":""+$rootScope.orgToken+""
				    },
				    data: reqData
				}).success(function(res){
					$scope.chid = $scope.formData.chainName;
					$scope.chvr = $scope.formData.chainVersion;
					console.log("instantiate Chaincode response",res);
					$scope.formData = {}
				}).error(function(error){
					console.log(error);	
				});
			}
			else{
				alert("select atleast one peer")
			}
		}
	}

})

app.controller("getDetailsCtrl",function($scope,$http,$rootScope){
			$scope.Dform = [false,false]
			function peers(){
				if($rootScope.orgName =="org1"){
					$scope.peers = {"peer0":"localhost:7051","peer1":"localhost:7056"}
					console.log($scope.peers)
				}
				else if($rootScope.orgName == "org2"){
					$scope.peers = {"peer2":"localhost:8051","peer3":"localhost:8056"}
					console.log($scope.peers)
				}
			}
			$scope.displayForm =function(index){
				$scope.Dform = [false,false]
				$scope.Dform[index]=true
				$scope.peerToJoin = [];
				if($scope.peers==undefined){
					peers()
				}	
			}
			$scope.isChecked =false;
			$scope.selectedPeers = function(peer,index){
				var count = 0
				for(var i=0;i<$scope.peerToJoin.length;i++){
					if($scope.peerToJoin[i]===peer){
						$scope.peerToJoin.splice(i,1)
						count = 1
					}
				}
				if(count==0){
					$scope.peerToJoin.push(peer)
				}
				console.log($scope.peerToJoin)
			}
	$scope.studentInformation = [];
	$scope.displayStudentDetails = function(){
		if($scope.formData.joinChannelName == undefined){
			$scope.formData.joinChannelName ="mychannel";
		}

		var reqData = {}
		reqData.peers=[];
		for(var i=0;i<$scope.peerToJoin.length;i++){
			reqData.peers[i]=$scope.peerToJoin[i]
		}
		reqData.chaincodeName = $scope.formData.chainName
		reqData.chaincodePath = $scope.formData.chainPath
		reqData.chaincodeVersion = $scope.formData.chainVersion;
		reqData.functionName = "getHistory"
		reqData.args= [$scope.getById.id1];

		$http({
		    method: 'POST',
		    url: '/channels/'+$scope.formData.joinChannelName+'/chaincodes/'+reqData.chaincodeName+'',
		    headers: {
			"authorization": "Bearer "+$rootScope.orgToken+"",
			"content-Type": "application/json",
			"x-access-token":""+$rootScope.orgToken+""
		    },
		    data:reqData
		}).success(function(res){
			console.log("student Details from chaincode : ",res);
			$scope.studentInformation = [];
			for( var i=0;i<res.length;i++){
				$scope.studentInformation[i] = res[i].StudentDetails;
				
			}
			console.log($scope.studentInformation.length)
			if ($scope.studentInformation.length === 0 ){
					$scope.showTable = false;
					$scope.noData = true;
				}
				else {
					$scope.showTable = true;
					$scope.noData = false;
					$scope.showAuth=false;
				}
			
			console.log("details",$scope.studentInformation);
		}).error(function(error){
			console.log(error);
		});
	}
	$scope.displayDetails = function(){
		//console.log($scope.chvr)
		if($scope.formData.joinChannelName == undefined){
			$scope.formData.joinChannelName ="mychannel";
		}
		var reqData = {}
		reqData.peers=[];
		for(var i=0;i<$scope.peerToJoin.length;i++){
			reqData.peers[i]=$scope.peerToJoin[i]
		}
		reqData.chaincodeName = $scope.formData.chainName
		reqData.chaincodePath = $scope.formData.chainPath
		reqData.chaincodeVersion = $scope.formData.chainVersion;
		reqData.functionName = "getHistory"
		reqData.args= [$scope.getById.id];
		$http({
		    method: 'POST',
		    url: '/channels/'+$scope.formData.joinChannelName+'/chaincodes/'+reqData.chaincodeName+'',
		    headers: {
			"authorization": "Bearer "+$rootScope.orgToken+"",
			"content-Type": "application/json",
			"x-access-token":""+$rootScope.orgToken+""
		    },
		    data:reqData
		}).success(function(res){
			console.log("student Details from chaincode : ",res);
			$scope.studentInformation = [];
			$scope.studentInformation[0] = res[res.length-1].StudentDetails;
			console.log($scope.studentInformation.length)
			if ($scope.studentInformation.length === 0 ){
					$scope.showTable = false;
					$scope.noData = true;
				}
				else {
					$scope.showTable = true;
					$scope.noData = false;
					$scope.showAuth=true;
					canAuth();
					canUpdate();
				}
			
			console.log("details",$scope.studentInformation);
		}).error(function(error){
			console.log(error);
		});
	}
	function canAuth(){
		if($scope.studentInformation[0].username == $rootScope.userName || $scope.studentInformation[0].createdBy == $rootScope.userName){
			$scope.showAuth = true;		
		}else{
			$scope.showAuth = false;		
		}
	}
	$scope.canUpdateList =[[]];
	function canUpdate(){
		//alert($scope.studentInformation[0].education.length)
		if($scope.studentInformation[0].education != undefined){
			for(var i=0;i<$scope.studentInformation.length;i++){
				for(var j=0;j<$scope.studentInformation[i].education.length;j++) {
					//alert($scope.studentInformation[i].education[j].WhoCanupdate.userName,$rootScope.userName);
					if($scope.studentInformation[i].education[j].WhoCanupdate.userName === $rootScope.userName){
						$scope.canUpdateList[i][j]=true;
						//alert(i,j);
					}
					else
						$scope.canUpdateList[i][j]=false;
				}	
			}
		}
		console.log("list",$scope.canUpdateList)
		console.log("test",$scope.canUpdateList[0][0])
	}
	$scope.eduIndex;
	$scope.stuId;
	$scope.setAuth = function(stuIndex,index,toggle){
		//console.log("student",$scope.studentInformation)
		//console.log($scope.studentInformation[stuIndex].education[index].WhoCanupdate.userName,$scope.studentInformation[stuIndex].education[index].WhoCanupdate.worksAt,$scope.studentInformation[stuIndex].education[index].WhoCanupdate.worksAs)
		$scope.eduIndex = index;
		$scope.stuId = $scope.getById.id;
		$scope.formData =[];
		//alert(stuIndex)
		if(toggle == 1){
			$scope.formData.userName =$scope.studentInformation[stuIndex].education[index].WhoCanupdate.userName 
			$scope.formData.worksAt = $scope.studentInformation[stuIndex].education[index].WhoCanupdate.worksAt
			$scope.formData.worksAs = $scope.studentInformation[stuIndex].education[index].WhoCanupdate.worksAs
		}else if(toggle =2){
			$scope.formData = {"studentDegree":$scope.studentInformation[stuIndex].education[index].degree,"studentBoard":$scope.studentInformation[stuIndex].education[index].board,"studentInstitute":$scope.studentInformation[stuIndex].education[index].Institute,"studentPassedOut":$scope.studentInformation[stuIndex].education[index].yearOfPassout,"studentScore":$scope.studentInformation[stuIndex].education[index].score}
		}
		console.log("formData",$scope.formData)
	}
	//CREATING AUTHORIZATION

	$scope.editAuth = function(){
		if($scope.formData.joinChannelName == undefined){
			$scope.formData.joinChannelName ="mychannel";
		}
		$http({
		    method: 'POST',
		    url: '/channels/'+$scope.formData.joinChannelName+'/chaincodes/mycc',
		    headers: {
			"authorization": "Bearer "+$rootScope.orgToken+"",
			"content-Type": "application/json",
			"x-access-token":""+$rootScope.orgToken+""
		    },
		    data:'{"peers": ["localhost:7051","localhost:7056"],"chaincodeVersion":"'+$scope.chvr+'","functionName":"cwcu","args":["'+($scope.getById.id)+'","'+$scope.eduIndex+'","'+$scope.formData.userName+'","'+$scope.formData.worksAt+'","'+$scope.formData.worksAs+'"]}'
		}).success(function(res){
			console.log("succesfully Updated");
			//$scope.getById.id=null
			$scope.getById.id=$scope.stuId;
			$scope.displayDetails()
			//console.log("details",$scope.studentInformation);
		}).error(function(error){
			console.log(error);
		});
	}
	$scope.updateEducation = function(){
		var user= $rootScope.userName.toLowerCase()
		if($scope.studentInformation[0].education[$scope.eduIndex].WhoCanupdate.userName != $rootScope.userName){
			alert("Sorry You cannot Perform the Update Operation On this information :( ");	
			return 0;	
		}
		else{
			if($scope.formData.joinChannelName == undefined){
				$scope.formData.joinChannelName ="mychannel";
			}
			$http({
			    method: 'POST',
			    url: '/channels/'+$scope.formData.joinChannelName+'/chaincodes/mycc',
			    headers: {
				"authorization": "Bearer "+$rootScope.orgToken+"",
				"content-Type": "application/json",
				"x-access-token":""+$rootScope.orgToken+""
			    },
			    data:'{"peers": ["localhost:7051","localhost:7056"],"chaincodeVersion":"'+$scope.chvr+'","functionName":"updateEdu","args":["'+($scope.stuId)+'","'+$scope.eduIndex+'","'+user+'","'+$scope.formData.studentDegree+'","'+$scope.formData.studentBoard+'","'+$scope.formData.studentInstitute+'","'+$scope.formData.studentPassedOut+'","'+$scope.formData.studentScore+'"]}'
			}).success(function(res){
				console.log("succesfully Updated");
				$scope.getById.id=parseInt($scope.stuId);
				$scope.displayDetails()
				console.log($scope.getById.id);
			}).error(function(error){
				console.log(error);
			});
		}
	}
	
})