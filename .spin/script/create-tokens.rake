# frozen_string_literal: true

namespace :development do
  namespace :token do
    task create: :environment do
      response = {}
      provider = OAuthProvider.find_by(id: 1)
      OAuthProvider::Current.set(oauth_provider: provider) do
        application =
          OAuthApplication.find_by(uid: "e5380e02-312a-7408-5718-e07017e9cf52")
        user = Account.find_by(email: "partners@shopify.com")

        device_spin_uuid = "3d0bfb46-d0ab-11ed-afa1-0242ac120002"
        device =
          Devices::CreateOrUpdate.perform(
            device_uuid: device_spin_uuid,
            ip_address: "127.0.0.1",
            user_agent: "User Agent"
          )

        session =
          IdentitySession.new(
            sid: SecureRandom.uuid,
            actor: user,
            uuid: SecureRandom.uuid,
            aud: application.uid,
            amr: ["pwd"],
            auth_time: Time.now.utc,
            account_created: false,
            dev: device_spin_uuid
          )
        session.save!

        subject =
          OAuthSubjectIdentifiers::FindOrCreate.perform(
            account: user,
            application: application
          )

        access_token =
          OAuthAccessToken.new(
            application: application,
            scopes: application.scopes.map(&:name).join(" "),
            resource_owner_id: subject.uuid,
            resource_owner_type: user.class.to_s,
            oauth_id_token_uuid: session.uuid,
            auth_time: session.auth_time,
            binary_device_uuid: device.uuid,
            expires_in: 30 * 24 * 60 * 60,
            amr: session.amr
          )

        access_token.assign_refresh_token
        access_token.save!
        TokenInfo.save_in_cache!(access_token)

        IdentitySessions::ExtendExpiry.perform(
          oauth_id_token_uuid: access_token.oauth_id_token_uuid
        )

        response = {
          access_token: access_token.token,
          refresh_token: access_token.refresh_token
        }
      end
      puts "create_token=#{response.to_json}"
    end
  end
end
