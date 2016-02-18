angular
  .module('walletApp')
  .controller("NavigationCtrl", NavigationCtrl);

function NavigationCtrl($rootScope, $scope, Wallet, currency, SecurityCenter, $translate, $cookies, $state, filterFilter, $interval, $timeout, $q, MyWallet) {
  $scope.status = Wallet.status;
  $scope.security = SecurityCenter.security;
  $scope.settings = Wallet.settings;

  let wallet = {};
  wallet.my = MyWallet.wallet;

  $scope.refresh = () => {
    $scope.refreshing = true;
    let amt = wallet.my.txList.transactions().length;
    $q.all([Wallet.my.wallet.getHistory(), currency.fetchExchangeRate(), wallet.my.txList.fetchTxs(amt, true)])
      .catch(() => console.log('error refreshing'))
      .finally(() => {
        $rootScope.$broadcast('refresh');
        $timeout(() => $scope.refreshing = false, 500);
      });
  }

  $scope.logout = () => {
    if (!Wallet.isSynchronizedWithServer()) {
      if (confirm("There are changes still being saved. Are you sure you wish to logout?")) {
        $scope.doLogout();
      }
    } else {
      $scope.doLogout();
    }
  };

  $scope.openZeroBlock = () => {
    const win = window.open('https://zeroblock.com', "_blank");
    win.focus();
  };

  $scope.openBCmarkets = () => {
    const win = window.open('https://markets.blockchain.info/', "_blank");
    win.focus();
  };

//  #################################
//  #           Private             #
//  #################################

  $scope.doLogout = () => {
    $translate("ARE_YOU_SURE_LOGOUT").then( translation => {
      if (confirm(translation)) {
        $scope.uid = null;
        $scope.password = null;
        $cookies.remove("password");
//      $cookies.remove("uid") // Pending a "Forget Me feature"

        $state.go("wallet.common.transactions", {
          accountIndex: ""
        });
        Wallet.logout();  // Refreshes the browser, so won't return
      }
    });
  };

  const intervalTime = 15 * 60 * 1000;
  $interval((() => {
    if (Wallet.status.isLoggedIn) {
      currency.fetchExchangeRate();
    }
  }), intervalTime);
}
